export class SocketManager {
  public static sockets: Map<string, SocketIO.Socket> = new Map()

  static addSocket(id: string, socket: SocketIO.Socket) {
    this.sockets.set(id, socket)
  }

  static getSocket(id: string) {
    return this.sockets.get(id)
  }

  static removeSocket(id: string) {
    return this.sockets.delete(id)
  }
}
