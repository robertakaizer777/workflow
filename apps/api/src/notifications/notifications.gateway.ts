import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' } // Na produção, deve ser restrito ao domínio do Frontend
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    // A autenticação do socket ocorreria extraindo o JWT do cabeçalho de handshake
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join-workspace')
  handleJoinWorkspace(client: Socket, workspaceId: string) {
    // Isola o cliente em uma sala específica do seu Workspace
    client.join(workspaceId);
    this.logger.log(`Cliente ${client.id} entrou na sala do workspace: ${workspaceId}`);
  }

  // Método utilitário para os outros módulos (ex: PostsProcessor) chamarem quando um evento ocorrer
  sendNotificationToWorkspace(workspaceId: string, event: string, payload: any) {
    this.server.to(workspaceId).emit(event, payload);
  }
}
