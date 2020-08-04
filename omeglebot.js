//Custom Textarea on homepage to get messages list served by the bot
const homepage = document.getElementById('intro');

const textAreaElements = () => {
    const textAreaHeader = document.createElement('H2');
    textAreaHeader.setAttribute("id", "intoheader");
    textAreaHeader.innerHTML = "Omegle Advanced Bot"

    const textArea = document.createElement('TEXTAREA');
    textArea.setAttribute("id", "mymsgs");
    textArea.setAttribute("placeholder", "Enter one message per line....");
    textArea.setAttribute("rows", "4");
    textArea.addEventListener('change', (event) => {
        messages = event.target.value.split(/\r?\n/);
    });

    return [textAreaHeader, textArea];
}
textAreaElements().forEach(element => homepage.appendChild(element))


let messages;
let messagesCounter = 0;
let sentMessages = 0;
let isGreetingsSent = false;


const isDisconnected = () => {
    const logItems = Array.from(document.getElementsByClassName("logitem"));
    const isDisconnected = logItems
        .filter(logItem => logItem.querySelector('p.statuslog'))
        .find(logItem => logItem.querySelector('p.statuslog').innerHTML === 'Stranger has disconnected.')
    return isDisconnected;
}

const reconnect = (forced = false) => {
    console.log('[debug] : reconnection started...')
    messagesCounter = 0;
    sentMessages = 0;
    isGreetingsSent = false;
    const newChatButton = document.getElementsByClassName('disconnectbtn')[0];
    newChatButton.click();
    if (!forced) return;
    setTimeout(() => {
        newChatButton.click();
        newChatButton.click();
    }, 500);

}

const sentAllMessages = () => (messages.length === sentMessages);


const sendMessage = (msg, delay = 4000) => {
    const chatBox = document.getElementsByClassName('chatmsg')[0];
    const sendButton = document.getElementsByClassName('sendbtn')[0];
    if (chatBox) {
        chatBox.value = "Preparing for next message ..."; //used to send request to /typing to avoid getting banned
        if (delay > 0)
            setTimeout(() => {
                chatBox.value = msg;
                sendButton.click();
                sentMessages++;

            }, delay);
        else {
            chatBox.value = msg;
            sendButton.click();
            sentMessages++;
            isGreetingsSent = true;
        }
    }
}

const callback = function (mutationsList, observer) {

    const logItems = Array.from(document.getElementsByClassName("logitem"));

    if (logItems.length >= 2) {

        if (isDisconnected())
            reconnect();

        if (sentAllMessages())
            reconnect(true);

        if (logItems.length === 2) {
            console.log("[debug] Chat has launched")
            messagesCounter = 0;
            sentMessages = 0;
            sendMessage(messages[0], 0);
        }

        //Stranger messages
        const strangerMessages = Array.from(logItems)
            .filter(logItem => logItem.querySelector('.strangermsg span'))
            .map(logItem => logItem.querySelector('.strangermsg span').innerHTML);

        if (messagesCounter < strangerMessages.length) {
            if (sentAllMessages())
                reconnect(true);
            messagesCounter = strangerMessages.length;

            if (strangerMessages.length < messages.length && isGreetingsSent) {
                sendMessage(messages[strangerMessages.length]);
            }
        }


    }
};
const observer = new MutationObserver(callback);
observer.observe(document, { attributes: false, childList: true, subtree: true });
