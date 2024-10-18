import { FormData } from './libs/formdata/0.0.2/index.js';
import { randomItem } from "./libs/k6-utils/1.4.0/index.js";

import { sleep } from "k6";
import http from "k6/http";
import { Rate } from "k6/metrics";

import { username } from "./utils/usernameData.js";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001/api";

const pdfFile = open("../dataset/foo.pdf", "b");

const urls = {
  auth: `${BASE_URL}/auth`,
  generalChat: `${BASE_URL}/send_message_stream`,
  policyChat: `${BASE_URL}/send_message_stream`,
  resetChat: `${BASE_URL}/reset_chat`,
  resetPolicy: `${BASE_URL}/reset_policy_chat`,
  pdfUpload: `${BASE_URL}/pdf_upload`,
};

const authFailRate = new Rate("failed_auth_fetches");
const generalChatFailRate = new Rate("failed_general_chat_submit");
const policyChatFailRate = new Rate("failed_policy_chat_submit");
const pdfUploadFailRate = new Rate("failed_upload_pdf_submit");

export const options = {
  scenarios: {
    file_upload_scenario: {
      executor: "constant-vus",
      exec: 'pdfUpload',
      vus: 20,
      duration: '5m',
    },
    general_chat_scenario: {
      executor: "constant-vus",
      exec: 'generalChat',
      vus: 30,
      duration: '5m',
    },
  },
};

function getUsername(): string {
  const randomName = randomItem(username);
  console.debug(`username: ${randomName}`);
  return randomName;
}

function getChatId(userId: string): number {
  const options = {
    headers: {
      "x-auth-gaia": `DSTA\\${userId}`,
    },
  };
  const res = http.get(urls.resetChat, options);
  const result = JSON.parse(JSON.parse(JSON.stringify(res.body)));
  return result.chatId;
}

const getAuth = () => {
  const options = {
    headers: {
      "x-auth-gaia": `DSTA\\${getUsername()}`,
    },
  };
  const result = http.get(urls.auth, options);
  authFailRate.add(result.status !== 200);
};

export function generalChat() {
  const testUser = getUsername();
  const chatId = getChatId(testUser);
  const payload = JSON.stringify({
    chatId: chatId,
    text: "Give a summary!",
    collection_name: "general",
  });
  const params = {
    headers: {
      "x-auth-gaia": `DSTA\\${testUser}`,
      "Content-Type": "application/json",
    },
  };
  const result = http.post(urls.generalChat, payload, params);
  generalChatFailRate.add(result.status != 200);
  sleep(1);
};

export function policyChat() {
  const testUser = getUsername();
  const chatId = getChatId(testUser);
  const payload = JSON.stringify({
    chatId: chatId,
    text: "Give a summary!",
    collection_name: "general",
  });
  const params = {
    headers: {
      "x-auth-gaia": `DSTA\\${testUser}`,
      "Content-Type": "application/json",
    },
  };
  const result = http.post(urls.policyChat, payload, params);
  policyChatFailRate.add(result.status != 200);
};

export function pdfUpload() {
  const testUser = getUsername();
  const chatId = getChatId(testUser);
  const fd = new FormData();
  fd.append('chatId', String(chatId));
  fd.append('File', http.file(pdfFile, 'foo.pdf', 'application/pdf'));
  const params = {
    headers: {
      "x-auth-gaia": `DSTA\\${testUser}`,
      'Content-Type': 'multipart/form-data; boundary=' + fd.boundary,
    },
  };
  const result = http.post(urls.pdfUpload, fd.body(), params);
  pdfUploadFailRate.add(result.status != 200);
  sleep(30);
};

