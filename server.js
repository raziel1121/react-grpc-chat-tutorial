const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "chat.proto";
const SERVER_URI = "0.0.0.0:9090";

const usersInChat = [];
const observers = [];

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const join = (call, callback) => {
  const user = call.request;

  const userExist = usersInChat.find((_user) => user.name == user.name);
  if (!userExist) {
    usersInChat.push(user)
    callback(null, { error: 0, msg: "success" });
  } else {
    callback(null, { error: 1, msg: "User already exists." });
  }
};

const getAllUsers = (call, callback) => {
  callback(null, { users: usersInChat });
};


const receiveMsg = (call, callback) => {
  observers.push({call});
};

const sendMsg = (call, callback) => {
  const chatObj = call.request;
  observers.forEach((Observer) => {
    observers.call.write(chatObj);
  });
  callback(null, {});
};

const server = new grpc.Server();
server.addService(protoDescriptor.ChatService.service, {
  join, sendMsg, getAllUsers, receiveMsg,
});
server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());
server.start();
console.log("Server is Runnig!");
