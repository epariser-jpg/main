exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { task, priority, slackToken, listId, channelId } = JSON.parse(event.body);

    // Get credentials from environment or request
    const token = process.env.SLACK_TOKEN || slackToken;
    const targetListId = process.env.SLACK_LIST_ID || listId;

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Slack token not configured' })
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

    // If we have a list ID, add to the list
    if (targetListId) {
      // First, post a message to get a message timestamp
      const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          text: task,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${task}`
              }
            }
          ]
        })
      });

      const messageData = await messageResponse.json();

      if (!messageData.ok) {
        console.error('Failed to post message:', messageData);

        // Provide helpful error messages based on common issues
        let helpfulMessage = `Slack API error: ${messageData.error}`;

        if (messageData.error === 'not_in_channel' || messageData.error === 'channel_not_found') {
          helpfulMessage += '\n\nThe bot needs to be invited to the channel. In Slack, type: /invite @Quick Task';
        } else if (messageData.error === 'missing_scope') {
          helpfulMessage += '\n\nMissing required permissions. Add chat:write and chat:write.public scopes to your Slack app, then reinstall it.';
        } else if (messageData.error === 'invalid_auth' || messageData.error === 'token_revoked') {
          helpfulMessage += '\n\nInvalid or revoked token. Generate a new OAuth token from your Slack app settings.';
        }

        return {
          statusCode: 400,
          body: JSON.stringify({
            error: helpfulMessage,
            slack_error: messageData.error,
            details: messageData
          })
        };
      }

      // Now add that message to the list
      const listResponse = await fetch('https://slack.com/api/lists.add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          list_id: targetListId,
          channel_id: channelId,
          message_ts: messageData.ts,
          // Optional: add metadata for priority
          metadata: {
            priority: priorityLabels[priority] || '2 - Today'
          }
        })
      });

      const listData = await listResponse.json();

      if (!listData.ok) {
        console.error('Failed to add to list:', listData);
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Failed to add to list',
            details: listData.error,
            message_posted: true,
            message_ts: messageData.ts
          })
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Task added to Slack List',
          list_item_id: listData.list_item_id
        })
      };
    } else {
      // Fallback: just post a message if no list ID
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          text: `New task: ${task}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*New Task*\n\n${task}\n\n_Priority: ${priorityLabels[priority] || '2 - Today'}_`
              }
            }
          ]
        })
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('Slack API error:', data);

        // Provide helpful error messages
        let helpfulMessage = `Slack API error: ${data.error}`;

        if (data.error === 'not_in_channel' || data.error === 'channel_not_found') {
          helpfulMessage += '\n\nThe bot needs to be invited to the channel. In Slack, type: /invite @Quick Task';
        } else if (data.error === 'missing_scope') {
          helpfulMessage += '\n\nMissing required permissions. Add chat:write and chat:write.public scopes to your Slack app, then reinstall it.';
        } else if (data.error === 'invalid_auth' || data.error === 'token_revoked') {
          helpfulMessage += '\n\nInvalid or revoked token. Generate a new OAuth token from your Slack app settings.';
        }

        return {
          statusCode: 400,
          body: JSON.stringify({
            error: helpfulMessage,
            slack_error: data.error,
            details: data
          })
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Task posted to Slack (not added to list - list ID needed)'
        })
      };
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
