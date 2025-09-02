from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    password: str


class CreateUser(UserBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenWithEmail(Token):
    user: EmailStr