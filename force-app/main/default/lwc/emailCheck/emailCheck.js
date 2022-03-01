import { LightningElement, api,wire } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { CloseActionScreenEvent } from "lightning/actions";
import ContactNotFoundMassage from '@salesforce/label/c.ContactNotFoundMessage';
import CONTACT_NAME from "@salesforce/schema/Contact.Name";
const fields = [CONTACT_NAME];
// GitHub API URL
const END_POINT = 'https://api.github.com/users/';
export default class EmailCheck extends LightningElement {
    @api recordId;
    dataObtained = false;
    isModalOpen = false;
    isResponseOK = false;
    contact;
    user = {};
    label = {
        ContactNotFoundMassage
    };
    
    @wire(getRecord, {
        recordId: "$recordId",
        fields
    })
    wiredContact({ data, error }) {
            if (data) {
                this.contact = data;
                let username = (getFieldValue(this.contact, CONTACT_NAME));
                this.fetchData(username.replaceAll(' ',''));

            }
            else if (error) {
                this.dataObtained = true;
                this.isResponseOK = false;
                console.error('wired Error:' + error);
            }
    }

    fetchData(username) {
        let endPoint = END_POINT+username;
        fetch(endPoint, {
            method: "GET"
        })
            .then((response) => {
                console.log('response: ' + response);
                if (response.ok) {
                    return response.json();
                } else {
                    console.log('Erro response: ' + JSON.stringify(response));
                    this.dataObtained = true;
                    this.isResponseOK = false;
                    throw Error(response);
                }
            })
            .then((githubUser) => {
                this.dataObtained = true;
                this.isResponseOK = true;
                this.user = {
                    id: githubUser.id,
                    name: githubUser.name,
                    username:username,
                    profile:githubUser.html_url,
                    image: githubUser.avatar_url,
                    blog: githubUser.blog,
                    about: githubUser.bio,
                    repos: githubUser.public_repos,
                    gists: githubUser.public_gists,
                    followers: githubUser.followers
                };
                console.log('Test: '+JSON.stringify(githubUser));
            })
            .catch(error => console.log(error));
    }

    closeModal() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}