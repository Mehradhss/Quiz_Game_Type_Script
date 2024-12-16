import generateRoomUuId from "../../services/Game/RoomCreation";
import createGame from "../../services/Game/game.creation.service";
import joinRoom from "../../services/Game/room.join.service";
import {io} from "../../server/serverConfig";
import asyncWrapper from "../../middleware/wrappers/asyncWrapper";
import {getRedisClient, getRedisSubscriber} from "../../RedisConfig/RedisConfig";
import {authSocketMiddleware} from "../../middleware/authMiddleware";
import {Socket} from "socket.io";
import socketWrapper from "../../middleware/wrappers/socketWrapper";
import {playerReadyToStart} from "../../services/Game/GameReadyToStart";
import {getVerifiedUserService} from "../../services/Auth/getVerifiedUser.service";
import createRoom from "../../services/Game/room.creation.service";
import {dataSource} from "../../../database/DataSource";
import {Category} from "../../../database/entity/Category";
import {GameRoom} from "../../../database/entity/GameRoom";
import {renew} from "../../services/Redis/redis.renew.expire.date.service";
import {getJoinAbleGameRoom, getEmptyGameRoom} from "../../services/Game/game.room.search.service";
import isUserJoined from "../../services/Game/room.is.user.joined.service";
import {Game} from "../../../database/entity/Game";
import {startGame} from "../../services/Game/game.start.service";
import {User} from "../../../database/entity/User";
import {fetchQuestion} from "../../services/Game/game.fetch.question.service";
import {submitAnswer} from "../../services/Game/game.submit.answer.service";
import {leaveRoom} from "../../services/Game/room.leave.service";
import {leaveGame} from "../../services/Game/game.leave.service";
import {endGame} from "../../services/Game/game.end.service";
import {gameResource} from "../../resources/game.resource";
import {userResource} from "../../resources/user.resource";
import {gameRoomResource} from "../../resources/game.room.resource";
import {answerResource} from "../../resources/answer.resource";

const gameStatus = Object.freeze({
    PENDING: 'PENDING',
    STARTED: 'STARTED',
    FINALIZING: 'FINALIZING',
    FINISHED: 'FINISHED'
});

const v1UserRoute = io.of('/v1/user').use((socket, next) => {
    authSocketMiddleware(socket, next)
})

// const v1UserRoute = io.of('/v1/user')

export const userSocketListeners = asyncWrapper(async () => {
        v1UserRoute.adapter.on("create-room", (room) => {
            console.log(`[${new Date().toISOString()}]`, `room ${room} was created`);
        })

        v1UserRoute.on('connection', asyncWrapper(async (socket: Socket) => {
                const socketId = socket.id;
                console.log(`A user connected with ID: ${socketId}`);

                const verifiedUser = await getVerifiedUserService(socket?.handshake?.headers.authorization.split('|')[1])

                verifiedUser.gameRooms.forEach((gameRoom: GameRoom) => {
                    socket.join(gameRoom.uuid)
                })

                const verifiedUserId = verifiedUser?.id

                const redisClient = await getRedisClient()

                socketWrapper(socket, 'createGameRoom', async () => {
                    try {
                        const availableEmptyRoom = await getEmptyGameRoom()

                        if (availableEmptyRoom) {
                            await joinRoom(socket, availableEmptyRoom.uuid, verifiedUserId)

                            redisClient.set(`room.${availableEmptyRoom.uuid}`, availableEmptyRoom.uuid, "EX", 30 * 60)

                            socket.emit('gameRoomCreated', {roomId: availableEmptyRoom.uuid})

                            return
                        }

                        const newRoom = await createRoom(verifiedUserId)

                        redisClient.set(`room.${newRoom.uuid}`, newRoom.uuid, "EX", 30 * 60)

                        socket.join(newRoom.uuid)

                        socket.emit('gameRoomCreated', {roomId: newRoom.uuid})
                    } catch (e) {
                        socket.emit("createGameRoomError", {error: {message: `unable to create room : ${e.message}`}})

                        console.log(e)
                    }
                })

                socketWrapper(socket, 'joinGameRoom', async (data) => {
                    try {
                        data = JSON.parse(data)

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not found");
                        }

                        const gameRoom = await dataSource.getRepository(GameRoom).findOne({
                            where: {
                                uuid: roomId
                            },
                            relations: ['users']
                        });

                        if (!gameRoom) {
                            throw new Error("room not found")
                        }

                        const isVerifiedUserJoined = await isUserJoined(gameRoom, verifiedUserId);

                        if (isVerifiedUserJoined) {
                            throw new Error("user already joined")
                        }

                        if (gameRoom && gameRoom.users.length < 2) {
                            throw new Error("room is full")
                        }
                        await joinRoom(socket, roomId, verifiedUserId);

                        await renew(`room.${gameRoom.uuid}`, 'room')

                        socket.emit('gameRoomJoined', {room: gameRoomResource(gameRoom)});
                        console.log('User joined game with room ID:', roomId);


                    } catch (e) {
                        socket.emit('gameRoomJoinError', {error: {message: `join room failed : ${e.message}`}});

                        console.log(e)
                    }
                })

                socketWrapper(socket, 'searchForGameRoom', async () => {
                    try {
                        const joinAbleGameRoom = await getJoinAbleGameRoom(verifiedUserId)

                        await renew(`room.${joinAbleGameRoom.uuid}`, 'room')

                        socket.emit('searchForGameSuccess', {data: gameRoomResource(joinAbleGameRoom)});
                    } catch (e) {
                        socket.emit('searchForGameError', {error: {message: "unable to search for game", e}});
                    }
                })

                socketWrapper(socket, 'selectCategory', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId;

                        if (!roomId || !verifiedUser.gameRooms.some((gameRoom) => gameRoom.uuid === roomId)) {
                            socket.emit("selectCategoryError", {error: {message: "room not found"}});

                            return
                        }

                        const categoryId = data.categoryId;

                        const categoryRepository = await dataSource.getRepository(Category);
                        const category = await categoryRepository.findOneOrFail({
                            where: {
                                id: categoryId
                            }
                        })

                        await renew(`room.${roomId}`, 'room')

                        v1UserRoute.to(roomId).emit("categorySelected", {
                            data: {
                                category: category
                            }
                        });
                    } catch (e) {
                        socket.emit('selectCategoryError', {error: {message: `unable to select category : ${e}`}});
                    }
                })

                socketWrapper(socket, 'createGame', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId;
                        if (!roomId) {
                            throw new Error('room id not provided');
                        }

                        const categoryId = data.categoryId;
                        if (!categoryId) {
                            throw new Error("category not provided")
                        }

                        const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                        const gameRoom = await dataSource.getRepository(GameRoom).findOneOrFail({
                            where: {
                                uuid: roomId
                            },
                            relations: ["users", "users.games", "games"]
                        })

                        if (!socketRoom || !gameRoom) {
                            throw new Error('room not found');
                        }

                        if (socketRoom.size < 2) {
                            throw new Error("a user disconnected")
                        }

                        if (gameRoom.users.length < 2) {
                            throw new Error("not enough players");
                        }

                        if (!await isUserJoined(gameRoom, verifiedUserId)) {
                            throw new Error("user not joined");
                        }

                        socket.join(gameRoom.uuid)

                        await renew(`room.${roomId}`, 'room')

                        const newGame = await createGame(gameRoom, gameStatus.PENDING, categoryId)

                        v1UserRoute.to(gameRoom.uuid).emit('gameCreated', {data: {game: newGame}})
                    } catch (e) {
                        socket.emit('gameCreationError', {error: {message: `unable to create game : ${e.message}`}});
                    }
                })

                socketWrapper(socket, 'readyToStart', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }

                        const gameId = data.gameId
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users"]
                        })

                        if (game.status === gameStatus.STARTED) {
                            throw new Error("game already started")
                        }

                        if (game.users.length < 2) {
                            throw new Error("not enough players to ready up !");
                        }

                        const playerReadyKey = `game.${gameId}.ready.players`;

                        const stringUserId = verifiedUserId.toString();

                        if (await redisClient.exists(playerReadyKey)) {
                            if (await redisClient.hexists(playerReadyKey, stringUserId)) {
                                throw new Error('player already readied up !')
                            }
                        }

                        await redisClient.hset(playerReadyKey, stringUserId, stringUserId)

                        await renew(playerReadyKey, "game")

                        await renew(`room.${roomId}`, 'room')

                        v1UserRoute.to(roomId).emit('playerReady', {data: {user: userResource(verifiedUser)}})
                    } catch (err) {
                        socket.emit('readyToStartError', {error: {message: `ready up failed to : ${err.message}`}})
                    }
                })

                socketWrapper(socket, "unreadyToStart", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }

                        const gameId = data.gameId
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users"]
                        })

                        if (game.status === gameStatus.STARTED) {
                            throw new Error("game already started")
                        }

                        if (game.users.length < 2) {
                            throw new Error("not enough players to ready up !");
                        }

                        const playerReadyKey = `game.${gameId}.ready.players`;

                        const stringUserId = verifiedUserId.toString();

                        if (!await redisClient.exists(playerReadyKey) || !await redisClient.hexists(playerReadyKey, stringUserId)) {
                            throw new Error('player has not readied up yet!')
                        }

                        await redisClient.hdel(playerReadyKey, stringUserId)

                        await renew(playerReadyKey, "game")

                        await renew(`room.${roomId}`, 'room')

                        v1UserRoute.to(roomId).emit('playerUnready', {data: {user: userResource(verifiedUser)}})
                    } catch (err) {
                        socket.emit('unreadyToStartError', {error: {message: `ready up failed to : ${err.message}`}})

                        console.log(err)
                    }

                })

                socketWrapper(socket, 'startGame', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        const socketRoom = v1UserRoute.adapter.rooms.get(roomId);

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        if (socketRoom.size < 2) {
                            throw new Error("a player disconnected!")
                        }

                        const playerReadyKey = `game.${gameId}.ready.players`;
                        if (!await redisClient.exists(playerReadyKey) || await redisClient.hlen(playerReadyKey) < 2) {
                            throw new Error("players must ready up")
                        }

                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users", "gameQuestions", "category", "session"]
                        });
                        if (game.status === gameStatus.STARTED) {
                            throw new Error("game already started")
                        }
                        if (game.users.length < 2) {
                            throw new Error("not enough players to start game !");
                        }

                        await renew(playerReadyKey, "game")

                        await renew(`room.${roomId}`, 'room')

                        const startedGame = await startGame(game, gameStatus.STARTED)

                        v1UserRoute.to(roomId).emit("gameStarted", {data: {game: gameResource(startedGame)}})
                    } catch (e) {
                        console.log(e)
                        socket.emit("gameStartError", {error: {message: `game failed to start : ${e.message}`}})
                    }
                })

                socketWrapper(socket, 'fetchQuestion', async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew(`room.${roomId}`, 'room')

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }
                        const game = await dataSource.getRepository(Game).findOne({
                            where: {
                                id: gameId
                            },
                            relations: ["users", "gameQuestions", "category"]
                        });

                        if (!game) {
                            throw new Error("game not found");
                        }
                        if (game.status === gameStatus.FINISHED) {
                            throw new Error("game is finished");
                        }

                        if (game.users.length < 2) {
                            throw new Error("not enough players to continue the game !");
                        }

                        if (game.status != gameStatus.STARTED) {
                            if (game.status === gameStatus.FINISHED) {
                                socket.emit("gameFinished", {data: {message: "this game is finished"}})

                                return
                            }

                            throw new Error("game has not started yet");
                        }

                        const fetchedGameQuestion = await fetchQuestion(game, verifiedUserId)

                        if (!fetchedGameQuestion) {
                            socket.emit("gameFinished", {
                                data: {
                                    message: "game finished",
                                    user: verifiedUser
                                }
                            })

                            v1UserRoute.to(roomId).emit("gameFinished", {
                                data: {
                                    message: "game finished",
                                    user: verifiedUser
                                }
                            })

                            throw new Error("all questions fetched!")
                        }

                        socket.emit("questionFetched", {data: {question: fetchedGameQuestion}})
                    } catch (e) {
                        console.log(e)
                        socket.emit("fetchQuestionError", {error: {message: `fetch question failed : ${e.message}`}})
                    }
                })

                socketWrapper(socket, "submitAnswer", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew(`room.${roomId}`, 'room')

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        const game = await dataSource.getRepository(Game).findOne({
                            where : {
                                id : gameId
                            }
                        })
                        if (!game) {
                            throw new Error("game not found")
                        }
                        if (game.status === gameStatus.FINISHED) {
                            throw new Error("game is finished")
                        }

                        const answer = data.answer;

                        await submitAnswer(verifiedUser, answer)

                        socket.emit("answerSubmitted", {data: {answer: answerResource(answer)}})

                    } catch (e) {
                        socket.emit("submitAnswerError", {error: {message: `an error accord during submitting answer : ${e.message}`}})

                        console.log(e)
                    }
                })

                socketWrapper(socket, "leaveGameRoom", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew(`room.${roomId}`, 'room')

                        if (!verifiedUser.gameRooms.some((gameRoom) => gameRoom.uuid === roomId)) {
                            throw new Error("user is not in the room!")
                        }

                        await leaveRoom(roomId, verifiedUserId, gameStatus.FINISHED)

                        socket.emit("leavedGame", {data: {roomId: roomId}})
                    } catch (e) {
                        socket.emit("leaveGameRoomError", {error: {message: `error leaving room: ${e.message}`}})
                    }
                });

                socketWrapper(socket, "leaveGame", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const roomId = data.roomId
                        if (!roomId) {
                            throw new Error("room id not provided")
                        }
                        await renew(`room.${roomId}`, 'room')

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["users"]
                        })

                        if (!game.users.some(user => user.id === verifiedUserId)) {
                            throw new Error("user is not in the game!")
                        }

                        await leaveGame(game, verifiedUserId);

                        socket.emit("leavedGame", {data: {game: {gameId: gameId}}})

                    } catch (e) {
                        socket.emit("leaveGameError", {error: {message: `error leaving game: ${e.message}`}})
                    }
                })

                socketWrapper(socket, "playerEndedGame", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["gameRoom", "users", "winner"]
                        })

                        await renew(`room.${game.gameRoom.uuid}`, 'room')

                        if (!game.users.some(user => user.id === verifiedUserId)) {
                            throw new Error("user is not in the game!")
                        }

                        const playerEndKey = `ended.${gameId}`

                        const stringUserId = verifiedUserId.toString();

                        if (await redisClient.exists(playerEndKey)) {
                            if (await redisClient.hexists(playerEndKey, stringUserId)) {
                                throw new Error('the game for this player has already ended!')
                            }

                            await redisClient.hset(playerEndKey, stringUserId, stringUserId)

                            if (await redisClient.hlen(playerEndKey) === game.users.length) {
                                await endGame(game, gameStatus.FINISHED)

                                v1UserRoute.to(game.gameRoom.uuid).emit("gameEnded", {
                                    data: {
                                        game: gameResource(game),
                                    }
                                })

                                return
                            }
                        }

                        v1UserRoute.to(game.gameRoom.uuid).emit("playerGameEnded", {
                            data: {
                                game: gameResource(game),
                                user: userResource(verifiedUser)
                            }
                        })
                    } catch (e) {
                        socket.emit("endGameError", {error: {message: `error leaving room: ${e.message}`}})
                    }
                })

                socketWrapper(socket, "endGame", async (data) => {
                    try {
                        data = JSON.parse(data);

                        const gameId = data.gameId;
                        if (!gameId) {
                            throw new Error("game id not provided")
                        }

                        const game = await dataSource.getRepository(Game).findOneOrFail({
                            where: {
                                id: gameId
                            },
                            relations: ["gameRoom", "users", "winner"]
                        })

                        await renew(`room.${game.gameRoom.uuid}`, 'room')

                        if (!game.users.some(user => user.id === verifiedUserId)) {
                            throw new Error("user is not in the game!")
                        }

                        if (game.status === gameStatus.FINISHED) {
                            throw new Error("game is already finished")
                        }

                        await endGame(game, gameStatus.FINISHED);

                        v1UserRoute.to(game.gameRoom.uuid).emit("gameEnded", {
                            data: {
                                game: gameResource(game),
                            }
                        })

                    } catch
                        (e) {
                        socket.emit("endGameError", {error: {message: `error leaving room: ${e.message}`}})
                    }
                })

                socketWrapper(socket, 'disconnect', async () => {
                    if (redisClient.exists(socketId)) {
                        redisClient.del(socketId)
                    }
                });
            })
        )
    }
)