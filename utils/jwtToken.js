// utils/jwtToken.js
export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  // LUÔN DÙNG CHUNG 1 COOKIE: userToken (dù là user hay admin)
  const cookieName = "userToken";

  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 7;

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({
      success: true,
      message,
      user: user.getPublicProfile ? user.getPublicProfile() : user, // sạch hơn
    });
};
