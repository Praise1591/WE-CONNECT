import { Client, Storage, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Your self-hosted endpoint
    .setProject('your-project-id');         // Found in Appwrite Console standard_347bce967e77470a097e8cea66147a0d8e700ad8d290d47c69b8f27542baf6de6ddf80f6e8b26339f8181f26f0d447615e77c5ed1b89728065674544061ca520d512a3bef7222c52fba4b5a5e6fe628bc73911a8a8c81237dd11feacead6d143ecd0c4fef5afde715d613f4ef64abf39cd6cc388af048814701e65543470291c

export const storage = new Storage(client);
export { ID };