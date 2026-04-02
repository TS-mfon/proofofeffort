# {"Depends": "py-genlayer:test"}

from dataclasses import dataclass
import json
import re

from genlayer import *


ERROR_EXPECTED = "[EXPECTED]"
ERROR_LLM = "[LLM_ERROR]"


def _parse_json_dict(raw: str) -> dict:
    if not raw:
        return {}
    try:
        first = raw.find("{")
        last = raw.rfind("}")
        if first == -1 or last == -1:
            return {}
        cleaned = re.sub(r",\s*([}\]])", r"\1", raw[first:last + 1])
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _parse_json_list(raw: str) -> list:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = getattr(leaders_res, "message", "")
    try:
        leader_fn()
        return False
    except gl.vm.UserError as exc:
        return str(exc) == leader_msg
    except Exception:
        return False


@allow_storage
@dataclass
class Engagement:
    client: Address
    worker: Address
    role_description: str
    standards_reference: str
    compensation: u256
    status: str
    progress_logs_json: str
    process_docs: str
    decisions: str
    deliverables_hash: str
    self_assessment: str
    external_factors: str
    outcome_result: str
    outcome_notes: str
    effort_score_json: str
    rationale: str
    created_tick: u256
    dispute_until_tick: u256


@allow_storage
@dataclass
class Dispute:
    engagement_id: str
    creator: Address
    justification: str
    status: str
    updated_score_json: str


class ProofOfEffort(gl.Contract):
    engagements: TreeMap[str, Engagement]
    engagement_order: DynArray[str]
    disputes: TreeMap[str, Dispute]
    worker_index: TreeMap[Address, str]
    engagement_nonce: u256
    dispute_nonce: u256
    tick: u256

    def __init__(self):
        self.engagement_nonce = 0
        self.dispute_nonce = 0
        self.tick = 0

    def _next_tick(self) -> u256:
        self.tick += 1
        return self.tick

    def _append_worker_index(self, worker: Address, engagement_id: str) -> None:
        records = _parse_json_list(self.worker_index.get(worker, "[]"))
        records.append(engagement_id)
        self.worker_index[worker] = json.dumps(records)

    @gl.public.write
    def create_engagement(
        self,
        role_description: str,
        standards_reference: str,
        worker_address: str,
        compensation: u256,
    ) -> str:
        engagement_id = "engagement-" + str(int(self.engagement_nonce))
        self.engagement_nonce += 1
        created_tick = self._next_tick()
        engagement = Engagement(
            client=gl.message.sender_address,
            worker=Address(worker_address),
            role_description=role_description[:500],
            standards_reference=standards_reference[:1000],
            compensation=compensation,
            status="CREATED",
            progress_logs_json="[]",
            process_docs="",
            decisions="",
            deliverables_hash="",
            self_assessment="",
            external_factors="",
            outcome_result="",
            outcome_notes="",
            effort_score_json="{}",
            rationale="",
            created_tick=created_tick,
            dispute_until_tick=0,
        )
        self.engagements[engagement_id] = engagement
        self.engagement_order.append(engagement_id)
        self._append_worker_index(engagement.worker, engagement_id)
        return engagement_id

    @gl.public.write
    def accept_engagement(self, engagement_id: str) -> bool:
        if engagement_id not in self.engagements:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown engagement")
        engagement = self.engagements[engagement_id]
        if gl.message.sender_address != engagement.worker:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only worker")
        engagement.status = "ACTIVE"
        self.engagements[engagement_id] = engagement
        self._next_tick()
        return True

    @gl.public.write
    def log_progress(self, engagement_id: str, progress_note: str) -> str:
        if engagement_id not in self.engagements:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown engagement")
        engagement = self.engagements[engagement_id]
        if gl.message.sender_address != engagement.worker:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only worker")
        logs = _parse_json_list(engagement.progress_logs_json)
        log_id = engagement_id + "-log-" + str(len(logs))
        logs.append({"log_id": log_id, "note": progress_note[:1000], "tick": int(self._next_tick())})
        engagement.progress_logs_json = json.dumps(logs, sort_keys=True)
        self.engagements[engagement_id] = engagement
        return log_id

    @gl.public.write
    def submit_work(
        self,
        engagement_id: str,
        process_docs: str,
        decisions: str,
        deliverables_hash: str,
        self_assessment: str,
        external_factors: str,
    ) -> str:
        if engagement_id not in self.engagements:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown engagement")
        engagement = self.engagements[engagement_id]
        if gl.message.sender_address != engagement.worker:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only worker")
        engagement.process_docs = process_docs[:3000]
        engagement.decisions = decisions[:2000]
        engagement.deliverables_hash = deliverables_hash[:500]
        engagement.self_assessment = self_assessment[:1000]
        engagement.external_factors = external_factors[:500]
        engagement.status = "WORK_SUBMITTED"
        self.engagements[engagement_id] = engagement
        self._next_tick()
        return engagement_id + "-submission"

    @gl.public.write
    def submit_outcome_assessment(self, engagement_id: str, outcome_result: str, outcome_notes: str) -> bool:
        if engagement_id not in self.engagements:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown engagement")
        engagement = self.engagements[engagement_id]
        if gl.message.sender_address != engagement.client:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only client")
        engagement.outcome_result = outcome_result[:500]
        engagement.outcome_notes = outcome_notes[:1000]
        self.engagements[engagement_id] = engagement
        self._next_tick()
        self._evaluate_effort_score(engagement_id)
        return True

    def _evaluate_effort_score(self, engagement_id: str) -> None:
        engagement = self.engagements[engagement_id]

        def leader_fn():
            prompt = f"""
Role: {engagement.role_description}
Standards: {engagement.standards_reference}
Process docs: {engagement.process_docs}
Decisions: {engagement.decisions}
Self assessment: {engagement.self_assessment}
External factors: {engagement.external_factors}
Outcome result: {engagement.outcome_result}
Outcome notes: {engagement.outcome_notes}

Return JSON only with:
{{
  "process": 0-40,
  "decision": 0-35,
  "docs": 0-25,
  "professionalism": 0-20,
  "rationale": "short explanation"
}}
"""
            result = _parse_json_dict(gl.nondet.exec_prompt(prompt))
            try:
                process = max(0, min(40, int(float(str(result.get("process", 0)).strip()))))
                decision = max(0, min(35, int(float(str(result.get("decision", 0)).strip()))))
                docs = max(0, min(25, int(float(str(result.get("docs", 0)).strip()))))
                professionalism = max(0, min(20, int(float(str(result.get("professionalism", 0)).strip()))))
            except Exception:
                raise gl.vm.UserError(f"{ERROR_LLM} invalid score")
            rationale = str(result.get("rationale", "")).strip()[:1500]
            return {
                "process": process,
                "decision": decision,
                "docs": docs,
                "professionalism": professionalism,
                "composite": process + decision + docs + professionalism,
                "rationale": rationale,
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, leader_fn)
            leader = leaders_res.calldata
            validator = leader_fn()
            return abs(int(leader.get("composite", 0)) - int(validator.get("composite", 0))) <= 20

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        engagement.effort_score_json = json.dumps(result, sort_keys=True)
        engagement.rationale = str(result.get("rationale", ""))[:1500]
        engagement.status = "EVALUATED"
        engagement.dispute_until_tick = int(self.tick) + 48
        self.engagements[engagement_id] = engagement

    @gl.public.write
    def dispute_score(self, engagement_id: str, justification: str) -> str:
        if engagement_id not in self.engagements:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown engagement")
        engagement = self.engagements[engagement_id]
        if gl.message.sender_address != engagement.client and gl.message.sender_address != engagement.worker:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only parties may dispute")
        if not self.is_within_dispute_window(engagement_id):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Dispute window closed")
        dispute_id = "dispute-" + str(int(self.dispute_nonce))
        self.dispute_nonce += 1
        self.disputes[dispute_id] = Dispute(
            engagement_id=engagement_id,
            creator=gl.message.sender_address,
            justification=justification[:2000],
            status="UNDER_REVIEW",
            updated_score_json="{}",
        )
        self._next_tick()
        return dispute_id

    @gl.public.write
    def resolve_dispute(self, dispute_id: str) -> u256:
        if dispute_id not in self.disputes:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown dispute")
        dispute = self.disputes[dispute_id]
        engagement = self.engagements[dispute.engagement_id]

        def leader_fn():
            current_score = _parse_json_dict(engagement.effort_score_json)
            prompt = f"""
Current score: {current_score}
Current rationale: {engagement.rationale}
Dispute justification: {dispute.justification}

Return JSON only with:
{{
  "updated_composite": 0-120,
  "process": 0-40,
  "decision": 0-35,
  "docs": 0-25,
  "professionalism": 0-20,
  "rationale": "updated explanation"
}}
"""
            result = _parse_json_dict(gl.nondet.exec_prompt(prompt))
            try:
                updated = max(0, min(120, int(float(str(result.get("updated_composite", 0)).strip()))))
            except Exception:
                raise gl.vm.UserError(f"{ERROR_LLM} invalid updated score")
            result["composite"] = updated
            return result

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, leader_fn)
            leader = leaders_res.calldata
            validator = leader_fn()
            return abs(int(leader.get("composite", 0)) - int(validator.get("composite", 0))) <= 20

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        engagement.effort_score_json = json.dumps(result, sort_keys=True)
        engagement.rationale = str(result.get("rationale", ""))[:1500]
        self.engagements[dispute.engagement_id] = engagement
        dispute.status = "RESOLVED"
        dispute.updated_score_json = engagement.effort_score_json
        self.disputes[dispute_id] = dispute
        return int(result.get("composite", 0))

    @gl.public.view
    def get_engagement(self, engagement_id: str) -> dict:
        if engagement_id not in self.engagements:
            return {}
        engagement = self.engagements[engagement_id]
        return {
            "engagement_id": engagement_id,
            "client": engagement.client.as_hex,
            "worker": engagement.worker.as_hex,
            "role_description": engagement.role_description,
            "standards_reference": engagement.standards_reference,
            "compensation": int(engagement.compensation),
            "status": engagement.status,
            "progress_logs": _parse_json_list(engagement.progress_logs_json),
            "outcome_result": engagement.outcome_result,
            "outcome_notes": engagement.outcome_notes,
        }

    @gl.public.view
    def get_worker_engagements(self, wallet_address: str) -> list[dict]:
        items: list[dict] = []
        for engagement_id in _parse_json_list(self.worker_index.get(Address(wallet_address), "[]")):
            items.append(self.get_engagement(engagement_id))
        return items

    @gl.public.view
    def get_effort_score(self, engagement_id: str) -> dict:
        if engagement_id not in self.engagements:
            return {}
        return _parse_json_dict(self.engagements[engagement_id].effort_score_json)

    @gl.public.view
    def get_average_effort_score(self, wallet_address: str) -> u256:
        records = _parse_json_list(self.worker_index.get(Address(wallet_address), "[]"))
        if len(records) == 0:
            return 0
        total = 0
        count = 0
        for engagement_id in records:
            score = _parse_json_dict(self.engagements[engagement_id].effort_score_json)
            if "composite" in score:
                total += int(score.get("composite", 0))
                count += 1
        if count == 0:
            return 0
        return total // count

    @gl.public.view
    def get_engagement_count(self, wallet_address: str) -> u256:
        return len(_parse_json_list(self.worker_index.get(Address(wallet_address), "[]")))

    @gl.public.view
    def get_leaderboard(self, category: str, limit: u256) -> list[dict]:
        del category
        items: list[dict] = []
        seen: list[str] = []
        for engagement_id in self.engagement_order:
            engagement = self.engagements[engagement_id]
            worker = engagement.worker.as_hex
            if worker in seen:
                continue
            seen.append(worker)
            items.append({"wallet": worker, "avg_score": int(self.get_average_effort_score(worker))})
        items = sorted(items, key=lambda item: -int(item["avg_score"]))
        return items[: int(limit)]

    @gl.public.view
    def get_dispute_status(self, dispute_id: str) -> dict:
        if dispute_id not in self.disputes:
            return {}
        dispute = self.disputes[dispute_id]
        return {
            "dispute_id": dispute_id,
            "engagement_id": dispute.engagement_id,
            "creator": dispute.creator.as_hex,
            "justification": dispute.justification,
            "status": dispute.status,
            "updated_score": _parse_json_dict(dispute.updated_score_json),
        }

    @gl.public.view
    def is_within_dispute_window(self, engagement_id: str) -> bool:
        if engagement_id not in self.engagements:
            return False
        engagement = self.engagements[engagement_id]
        return int(self.tick) <= int(engagement.dispute_until_tick)
