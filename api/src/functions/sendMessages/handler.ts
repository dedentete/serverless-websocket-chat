import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { getEndpoint } from 'src/common/endpoint';

const dynamoDBClient = new DynamoDBClient({ region: process.env.CUSTOM_AWS_REGION });

/**
 * @param event
 * @param _context
 * @param _callback
 * @returns
 */
const sendMessages: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  _context,
  _callback
) => {
  try {
    const callbackAPI = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: getEndpoint(event.requestContext),
    });

    const params = {
      TableName: process.env.CONNECTIONS_TABLE_NAME,
    };
    const result = await dynamoDBClient.send(new ScanCommand(params));
    const connections = result.Items.map(item => unmarshall(item));
    const message = JSON.parse(event.body).message;

    await Promise.all(
      connections.map(async (connection) => {
        if (connection.connectionId === event.requestContext.connectionId) return;
        await callbackAPI.postToConnection({
          ConnectionId: connection.connectionId,
          Data: message,
        });
      })
    );

    return {
      statusCode: 200,
      body: 'sendMessages',
    };
  } catch (err) {
    console.log(err);
  }
};

export const main = sendMessages;