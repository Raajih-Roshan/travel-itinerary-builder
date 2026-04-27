const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ── Welcome Email ─────────────────────────────────
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from:    `"Travel Itinerary Builder" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: '✈️ Welcome to Travel Itinerary Builder!',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0f4f8; padding: 20px;">
        <div style="background: #1a1a2e; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✈️ Travel Itinerary Builder</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #1a1a2e; margin-bottom: 16px;">Welcome, ${userName}! 🎉</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Your account has been created successfully. You can now start planning your trips!
          </p>
          <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #4f46e5;">
            <h3 style="color: #4f46e5; margin-bottom: 12px; font-size: 15px;">What you can do:</h3>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">✈️ Create and manage trips</p>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">👥 Invite collaborators to plan together</p>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">🏨 Add flights, hotels and activities</p>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">💰 Track your travel budget</p>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">🌍 Check live weather for destinations</p>
            <p style="color: #555; margin: 6px 0; font-size: 14px;">📸 Upload trip memories</p>
          </div>
          <div style="text-align: center;">
            <a href="http://localhost:3000" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              Start Planning →
            </a>
          </div>
          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">
            Happy Travels! 🌍<br/>Travel Itinerary Builder Team
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', toEmail);
  } catch (err) {
    console.error('❌ Welcome email failed:', err.message);
  }
};

// ── Collaborator Invite Email ─────────────────────
const sendInviteEmail = async (toEmail, inviterName, tripTitle, tripId) => {
  const mailOptions = {
    from:    `"Travel Itinerary Builder" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: `✈️ ${inviterName} invited you to join "${tripTitle}"`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0f4f8; padding: 20px;">
        <div style="background: #1a1a2e; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✈️ Travel Itinerary Builder</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h2 style="color: #1a1a2e; margin-bottom: 16px;">You've been invited! 🎉</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to collaborate on the trip:
          </p>
          <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #4f46e5; text-align: center;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 22px;">🗺️ ${tripTitle}</h2>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Login to your Travel Itinerary Builder account to view and contribute to this trip's timeline, budget and more!
          </p>
          <div style="text-align: center;">
            <a href="http://localhost:3000" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              View Trip →
            </a>
          </div>
          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 24px;">
            If you don't have an account yet, register at
            <a href="http://localhost:3000/register" style="color: #4f46e5;">Travel Itinerary Builder</a>
          </p>
          <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 8px;">
            Happy Travels! 🌍
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Invite email sent to:', toEmail);
  } catch (err) {
    console.error('❌ Invite email failed:', err.message);
  }
};
// ── Goodbye Email ─────────────────────────────────
const sendGoodbyeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from:    `"Travel Itinerary Builder" <${process.env.GMAIL_USER}>`,
    to:      toEmail,
    subject: '👋 We\'re sad to see you go — Goodbye from Travel Itinerary Builder',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f0f4f8; padding: 20px;">

        <div style="background: #1a1a2e; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✈️ Travel Itinerary Builder</h1>
        </div>

        <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 56px;">👋</span>
          </div>

          <h2 style="color: #1a1a2e; margin-bottom: 12px; text-align: center;">
            Goodbye, ${userName}
          </h2>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            Your account has been permanently deleted.<br/>
            We're really sad to see you go.
          </p>

          <div style="background: #f8f8ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #4f46e5;">
            <p style="color: #555; font-size: 14px; margin: 0 0 10px; font-weight: 600;">
              What has been deleted:
            </p>
            <p style="color: #888; font-size: 13px; margin: 5px 0;">🗺️ All your trips and itineraries</p>
            <p style="color: #888; font-size: 13px; margin: 5px 0;">📅 All timeline items</p>
            <p style="color: #888; font-size: 13px; margin: 5px 0;">📸 All memories and uploaded photos</p>
            <p style="color: #888; font-size: 13px; margin: 5px 0;">👤 Your account and personal data</p>
          </div>

          <div style="background: #fff9e6; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #f59e0b; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
              💛 We hope your travels were wonderful!
            </p>
            <p style="color: #92400e; font-size: 13px; margin: 8px 0 0;">
              You are always welcome to come back and create a new account.
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:3000/register"
              style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
              Create New Account →
            </a>
          </div>

          <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center;">
            <p style="color: #aaa; font-size: 13px; margin: 0;">
              🌍 Safe travels wherever life takes you next!
            </p>
            <p style="color: #aaa; font-size: 12px; margin: 8px 0 0;">
              — The Travel Itinerary Builder Team
            </p>
          </div>

        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Goodbye email sent to:', toEmail);
  } catch (err) {
    console.error('❌ Goodbye email failed:', err.message);
  }
};

module.exports = { sendWelcomeEmail, sendInviteEmail, sendGoodbyeEmail };