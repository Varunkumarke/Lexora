
import bcrypt
from datetime import datetime
from bson import ObjectId


class User:
    def __init__(
        self,
        name: str,
        email: str,
        password: str = None,
        resetPasswordToken: str = None,
        resetPasswordExpires: datetime = None,
        isVerified: bool = False,
        createdAt: datetime = None,
        role: str = "user",
        _id: ObjectId = None,
    ):
        self._id = _id or ObjectId()
        self.name = name.strip()
        self.email = email.lower().strip()
        self.password = password
        self.resetPasswordToken = resetPasswordToken
        self.resetPasswordExpires = resetPasswordExpires
        self.isVerified = isVerified
        self.createdAt = createdAt or datetime.utcnow()
        self.role = role or "user"

    # Password hashing
    def set_password(self, raw_password: str):
        if not raw_password or len(raw_password) < 8:
            raise ValueError("Password must be at least 8 characters")

        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(raw_password.encode("utf-8"), salt)
        self.password = hashed.decode("utf-8")

    # Password verification
    def check_password(self, candidate_password: str) -> bool:
        if not self.password or not candidate_password:
            return False

        return bcrypt.checkpw(
            candidate_password.encode("utf-8"),
            self.password.encode("utf-8"),
        )

    # MongoDB document
    def to_mongo(self) -> dict:
        return {
            "_id": self._id,
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "resetPasswordToken": self.resetPasswordToken,
            "resetPasswordExpires": self.resetPasswordExpires,
            "isVerified": self.isVerified,
            "createdAt": self.createdAt,
            "role": self.role,
        }

    # JSON-safe response
    def to_json(self) -> dict:
        return {
            "id": str(self._id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
        }

    # Create User from MongoDB document
    @staticmethod
    def from_mongo(data: dict):
        if not data:
            return None

        return User(
            _id=data.get("_id"),
            name=data.get("name"),
            email=data.get("email"),
            password=data.get("password"),
            resetPasswordToken=data.get("resetPasswordToken"),
            resetPasswordExpires=data.get("resetPasswordExpires"),
            isVerified=data.get("isVerified", False),
            createdAt=data.get("createdAt"),
            role=data.get("role", "user"),
        )
