import { faker } from "@faker-js/faker/locale/en_US";

export const generateSubscriber = () => ({
	name: `SUBSCRIPTION_TEST - ${faker.person.firstName()} ${faker.person.lastName()}`,
	title: faker.person.jobTitle(),
	company: faker.company.name(),
	email: faker.internet.email(),
	country: faker.location.country(),
});
