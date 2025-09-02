from pydantic import BaseModel, EmailStr, field_validator


class UserBase(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '@$!%*?&' for c in v):
            raise ValueError('Password must contain at least one special character (@$!%*?&)')
        return v

class CreateUser(UserBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithEmail(Token):
    user: EmailStr