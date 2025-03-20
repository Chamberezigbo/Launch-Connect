const resetPasswordTemplate = (
  name,
  resetLink,
  emailMessage,
  resetTokenExpiry
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { background: #fff; padding: 20px; border-radius: 5px; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h2 { color: #333; }
    p { font-size: 16px; }
    a { background-color: #007bff; color: white; text-decoration: none; padding: 10px 15px; border-radius: 5px; display: inline-block; }
    .footer { margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
       <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <img src="https://your-logo-url.com/logo.png" alt="Launch Connect" style="max-width: 150px; margin-bottom: 10px;">
              <h2 style="color: #333;">Launch Connect</h2>
              <p style="font-size: 16px; color: #555;">Hi ${name}, ${emailMessage}</p>
              <p style="color:tomato; font-size: 25px; letter-spacing: 2px; font-weight: bold;">${resetLink}</p>
              <p style="font-size: 14px; color: #777;">This code <b>expires in ${resetTokenExpiry} minite(s)</b></p>
       </div>
</body>
</html>
`;

module.exports = resetPasswordTemplate;
