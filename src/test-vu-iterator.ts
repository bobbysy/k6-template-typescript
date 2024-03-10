import { sleep } from "k6";
import { vu } from "k6/execution";

import { generateSubscriber } from "./subscriber";

export const options = {
	scenarios: {
		unique_data: {
			executor: "per-vu-iterations",
			vus: 5,
			iterations: 1,
		},
	},
};

const submitForm = () => {
	console.log(`Test Id: ${vu.idInTest}`);
	const person = generateSubscriber();
	console.log(JSON.stringify(person));
};

export default function () {
	submitForm();
	sleep(1);
}
