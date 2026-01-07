exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { task, priority, webhookUrl } = JSON.parse(event.body);

    // Use webhook URL from environment variable or from request
    const slackWebhook = process.env.SLACK_WEBHOOK_URL || webhookUrl;

    if (!slackWebhook) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Webhook URL not configured' })
      };
    }

    if (!task) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Task is required' })
      };
    }

    const priorityLabels = {
      '1': '1 - Today',
      '2': '2 - Today',
      '3': '3 - Week'
    };

    const message = {
      text: `New task: ${task}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New Task Added*\n\n${task}\n\n_Priority: ${priorityLabels[priority] || '2 - Today'}_`
          }
        }
      ]
    };

    // Forward to Slack
    const response = await fetch(slackWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack API error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to send to Slack', details: errorText })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, message: 'Task sent to Slack' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
