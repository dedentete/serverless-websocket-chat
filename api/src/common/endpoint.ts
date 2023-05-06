import { APIGatewayEventWebsocketRequestContextV2 } from 'aws-lambda';

/**
 * @param requestContext
 * @returns endpoint
 */
export const getEndpoint = (
  requestContext: APIGatewayEventWebsocketRequestContextV2
) => {
  const { domainName, stage } = requestContext;
  const localEndpoint = 'http://localhost:3001';
  const cloudEndpoint = `https://${domainName}/${stage}`;

  const endpoint = stage === 'local' ? localEndpoint : cloudEndpoint;

  return endpoint;
};
