// Email Templates Utility

const getWelcomeEmail = (name, role) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features ul { list-style: none; padding: 0; margin: 0; }
    .features li { padding: 10px 0; border-bottom: 1px solid #e9ecef; display: flex; align-items: center; }
    .features li:last-child { border-bottom: none; }
    .features li::before { content: "✓"; color: #667eea; font-weight: bold; margin-right: 10px; font-size: 18px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AI Hire!</h1>
      <p>Your AI-powered job search journey begins now</p>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Welcome to AI Hire! We're thrilled to have you on board. Your account has been successfully created using Google authentication.</p>
      
      <div class="features">
        <ul>
          <li>AI-powered job matching (96% accuracy)</li>
          <li>Access to 10,000+ job listings</li>
          <li>Connect with 500+ top companies</li>
          <li>Smart resume analysis and ranking</li>
          <li>Real-time application tracking</li>
        </ul>
      </div>
      
      <p>Complete your profile to unlock personalized job recommendations and let our AI find the perfect opportunities for you.</p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/complete-profile-${role}.html" class="cta-button">Complete Your Profile</a>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit Website</a> | <a href="#">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

const getEmailVerificationOTP = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .warning p { margin: 0; color: #856404; font-size: 14px; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Thank you for signing up with AI Hire! To complete your registration, please verify your email address using the verification code below.</p>
      
      <div class="otp-box">${otp}</div>
      
      <p>This code will expire in 10 minutes for your security.</p>
      
      <div class="warning">
        <p><strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email. Your account remains secure.</p>
      </div>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getForgotPasswordOTP = (name, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .warning p { margin: 0; color: #856404; font-size: 14px; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We received a request to reset your password for your AI Hire account. Use the verification code below to proceed with the password reset.</p>
      
      <div class="otp-box">${otp}</div>
      
      <p>This code will expire in 10 minutes for your security.</p>
      
      <div class="warning">
        <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
      </div>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getPasswordResetConfirmation = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .success-box p { margin: 0; color: #155724; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Successful</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      
      <div class="success-box">
        <p>✓ Your password has been successfully reset!</p>
      </div>
      
      <p>You can now log in to your AI Hire account using your new password. If you didn't make this change, please contact our support team immediately.</p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login.html" class="cta-button">Log In to Your Account</a>
      
      <p>For your security, we recommend using a strong, unique password for your account.</p>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getAccountApprovalEmail = (name, role) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .success-box p { margin: 0; color: #155724; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Approved!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      
      <div class="success-box">
        <p>✓ Your ${role} account has been approved!</p>
      </div>
      
      <p>Congratulations! Your account has been reviewed and approved by our team. You now have full access to all features on AI Hire.</p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login.html" class="cta-button">Log In to Your Account</a>
      
      <p>Start exploring opportunities and connecting with top talent today!</p>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getAccountRejectionEmail = (name, reason) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Update - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-box p { margin: 0; color: #856404; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Update</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      
      <div class="info-box">
        <p>We have reviewed your account application and require some additional information.</p>
      </div>
      
      <p><strong>Reason:</strong> ${reason || 'Please complete your profile with accurate information.'}</p>
      
      <p>Please update your profile with the required information and submit it for review again. If you have any questions, feel free to contact our support team.</p>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getApplicationReceivedEmail = (name, jobTitle, companyName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - AI Hire</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .content h2 { color: #667eea; margin-top: 0; font-size: 22px; }
    .content p { margin-bottom: 20px; color: #555; }
    .job-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .job-card h3 { margin: 0 0 10px; color: #333; }
    .job-card p { margin: 5px 0; color: #666; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e9ecef; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Your application has been successfully submitted. Here are the details:</p>
      
      <div class="job-card">
        <h3>${jobTitle}</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Status:</strong> Under Review</p>
      </div>
      
      <p>Our AI system is analyzing your profile against the job requirements. You'll receive updates on your application status.</p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-applications.html" class="cta-button">View Your Applications</a>
      
      <p>Best regards,<br>The AI Hire Team</p>
    </div>
    <div class="footer">
      <p>© 2024 AI Hire. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  getWelcomeEmail,
  getEmailVerificationOTP,
  getForgotPasswordOTP,
  getPasswordResetConfirmation,
  getAccountApprovalEmail,
  getAccountRejectionEmail,
  getApplicationReceivedEmail
};
