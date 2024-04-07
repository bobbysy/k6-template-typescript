import { check, sleep } from "k6";
import http from "k6/http";
import type { Options } from "k6/options";
import { FormData } from "https://jslib.k6.io/formdata/0.0.2/index.js";

export const options: Options = {
  discardResponseBodies: true,
  scenarios: {
    grpcUpload: {
      executor: "constant-vus",
      exec: "grpcUpload",
      vus: 10,
      duration: "10s",
      gracefulStop: "0s", // do not wait for iterations to finish in the end
    },
  },
};

export const binFile = open("/path/to/files/foo.pdf", "b");

export var uploaded = false;

export function grpcUpload() {
  // override to execute the API request exactly once
  if (!uploaded && __ITER === 0) {
    const fd = new FormData();
    fd.append("file", {
      data: new Uint8Array(binFile).buffer,
      filename: "foo.pdf",
      content_type: "application/json",
    });
    const res = http.post("http://localhost:8000/grpc/upload", fd.body(), {
      headers: {
        "Content-Type": "multipart/form-data; boundary=" + fd.boundary,
      },
    });

    check(res, {
      "status is 201": () => res.status === 201,
    });
  }
  sleep(3);
  uploaded = true;
}
