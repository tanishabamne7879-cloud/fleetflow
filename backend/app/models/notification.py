import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, DateTime, Boolean, Enum, Text
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class NotificationTypeEnum(str, enum.Enum):
    Info = "Info"
    Warning = "Warning"
    Alert = "Alert"
    Success = "Success"

class Notification(Base):
    __tablename__ = "notifications"
    
    notification_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.user_id"))
    title = Column(String(200))
    message = Column(Text)
    type = Column(Enum(NotificationTypeEnum), default=NotificationTypeEnum.Info)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)