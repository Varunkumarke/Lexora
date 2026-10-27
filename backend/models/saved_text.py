# models/saved_text.py
from datetime import datetime
from bson import ObjectId

class SavedText:
    def __init__(
        self,
        generated_text: str,
        level: str,
        task_id: str,
        title: str = None,  # NEW: Add title field
        final_structure: list = None,
        evaluation_result: dict = None,
        created_at: datetime = None,
        _id: ObjectId = None
    ):
        self._id = _id or ObjectId()
        self.generated_text = generated_text
        self.level = level
        self.task_id = task_id
        self.title = title  # NEW
        self.final_structure = final_structure or []
        self.evaluation_result = evaluation_result or {}
        self.created_at = created_at or datetime.utcnow()

    def to_mongo(self) -> dict:
        return {
            "_id": self._id,
            "generated_text": self.generated_text,
            "level": self.level,
            "task_id": self.task_id,
            "title": self.title,  # NEW
            "final_structure": self.final_structure,
            "evaluation_result": self.evaluation_result,
            "created_at": self.created_at
        }

    @staticmethod
    def from_mongo(data: dict):
        if not data:
            return None
        
        return SavedText(
            _id=data.get("_id"),
            generated_text=data.get("generated_text"),
            level=data.get("level"),
            task_id=data.get("task_id"),
            title=data.get("title"),  # NEW
            final_structure=data.get("final_structure", []),
            evaluation_result=data.get("evaluation_result", {}),
            created_at=data.get("created_at")
        )