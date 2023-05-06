import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: process.env.CUSTOM_AWS_REGION });

/**
 * @param event
 * @param _context
 * @param _callback
 * @returns
 */
const onConnect: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  _context,
  _callback
) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const item = {
      connectionId,
    };
    const params = {
      Item: marshall(item),
      TableName: process.env.CONNECTIONS_TABLE_NAME,
    };
    const command = new PutItemCommand(params);
    await dynamoDBClient.send(command);

    console.log('connected!');

    return {
      statusCode: 200,
      body: 'connected',
    };
  } catch (err) {
    console.log(err);
  }
};

export const main = onConnect;
