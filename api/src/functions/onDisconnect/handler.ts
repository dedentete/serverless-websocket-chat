import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: process.env.CUSTOM_AWS_REGION });

/**
 * @param event
 * @param _context
 * @param _callback
 * @returns
 */
const onDisconnect: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  _context,
  _callback
) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const key = {
      connectionId,
    };
    const params = {
      Key: marshall(key),
      TableName: process.env.CONNECTIONS_TABLE_NAME,
    };
    await dynamoDBClient.send(new DeleteItemCommand(params));

    console.log('disconnected!');
    
    return {
      statusCode: 200,
      body: 'disconnected',
    };
  } catch (err) {
    console.log(err);
  }
};

export const main = onDisconnect;