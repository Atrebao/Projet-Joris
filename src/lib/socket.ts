import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket Joris:', socket?.id)
      
      // Rejoindre automatiquement les rooms selon la session stockée
      try {
        const infoUser = JSON.parse(localStorage.getItem('infoUser') || '{}')
        const user = infoUser?.user || JSON.parse(localStorage.getItem('user') || '{}')
        const partenaire = infoUser?.partenaire || JSON.parse(localStorage.getItem('partenaire') || '{}')

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'admin') {
          socket?.emit('join_room', { room: 'admin' })
        }
        if (partenaire?.id) {
          socket?.emit('join_room', { room: `partenaire_${partenaire.id}` })
        }
      } catch (e) {
        // Ignore
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('Déconnecté du WebSocket Joris:', reason)
    })
  }

  return socket
}

export const joinRoom = (room: string) => {
  const s = getSocket()
  if (s.connected) {
    s.emit('join_room', { room })
  } else {
    s.once('connect', () => {
      s.emit('join_room', { room })
    })
  }
}

export const leaveRoom = (room: string) => {
  const s = getSocket()
  s.emit('leave_room', { room })
}

export const onSocketEvent = (eventName: string, callback: (data: any) => void) => {
  const s = getSocket()
  s.on(eventName, callback)
  return () => {
    s.off(eventName, callback)
  }
}
