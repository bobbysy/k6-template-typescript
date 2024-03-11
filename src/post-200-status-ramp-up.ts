import { sleep } from "k6";
import { check } from "k6";
import http from "k6/http";

export const options = {
  // define thresholds
  thresholds: {
    // http errors should be less than 5%
    http_req_failed: ["rate<0.05"],
    // 95% of requests should be below 3s
    http_req_duration: ["p(95)<3000"],
  },
  // define scenarios
  scenarios: {
    ramping_up: {
      executor: "ramping-vus",
      stages: [
        // ramp up to average load of 20 virtual users
        { duration: "10s", target: 20 },
        // ramp up to average load of 50 virtual users
        { duration: "10s", target: 50 },
        // maintain load
        { duration: "50s", target: 50 },
        // ramp down to zero
        { duration: "5s", target: 0 },
      ],
    },
  },
};

const submitTest = () => {
  const url = "http://test-api.k6.io/auth/basic/login/";
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const payload = JSON.stringify({
    temperature: "0.4",
    model: "llama-2-13b-chat",
    stream: true,
    messages: [
      {
        role: "user",
        content:
          "Answer as if you were the medical director of an anesthesia service. Develop a preoperatively testing algorithm reported in a chart format. Select specific tests that are required for each test based on both particular medical diagnoses as well as by the type of operation is planned.",
      },
    ],
    max_tokens: 512,
  });
  // send a post request and save response as a variable
  const res = http.post(url, payload, params);

  // check that response is 200
  check(res, {
    "response code was 200": (res) => res.status === 200,
  });
};

export default function () {
  submitTest();
  sleep(1);
}
