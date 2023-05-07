import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi';
import { TextEncoder } from 'util';
import { getEndpoint } from 'src/common/endpoint';

/**
 * @param event
 * @param _context
 * @param _callback
 * @returns
 */
const defaultFunction: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  _context,
  _callback
) => {
  try {
    const apiManage = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: getEndpoint(event.requestContext),
    });

    const data = new TextEncoder().encode('not defined action...');

    await apiManage.postToConnection({
      ConnectionId: event.requestContext.connectionId,
      Data: data,
    });

    return {
      statusCode: 200,
      body: 'defaultRoute',
    };
  } catch (err) {
    console.log(err);
  }
};

export const main = defaultFunction;