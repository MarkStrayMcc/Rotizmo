/*
 * CFC Insight Hero Plugin 
 * 
 * Copyright 2021 CFC Underwriting Ltd. All Rights Reserved.
 * 
 * @name: insight-plugin.js
 * @author: rwells@cfcunderwriting.com
 * @version: 0.1.0
 * 
 * This plugin creates an overlay panel for displaying CFC Insight client alerts
 * and firmographic data when viewing enquires.
 * 
 * This plugin should not interact in any way with angular application, and all js/css namespacing
 * should start with "insightPlugin" to avoid collisions
 * 
 */

/*
 * Set to true to enable console logs
 */
const insightPluginDebug = false;
let insightClientAlertsHost = "data-services.cfcapps.com/client-alerts";
let domain = window.location.href;
if (domain.startsWith("https://dev") || domain.startsWith("https://localhost")) {
    insightClientAlertsHost = "dev-data-services.cfcapps.com/client-alerts";
} else if (domain.startsWith("https://rc")) {
    insightClientAlertsHost = "rc-data-services.cfcapps.com/client-alerts";
}

/*
 * Include SVG icons to be used by the UI
 */
const insightPluginIconStore = {
    alert: '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g><path fill="white" d="M501.35,369.069L320.565,66.266c-13.667-23.008-37.805-36.749-64.567-36.749c-26.762,0-50.9,13.741-64.567,36.749L10.662,369.069c-13.96,23.492-14.224,51.706-0.719,75.462c13.536,23.771,37.922,37.951,65.27,37.951h361.57c27.348,0,51.736-14.18,65.27-37.951C515.56,420.776,515.296,392.561,501.35,369.069z M255.999,122.094c16.587,0,30.032,13.445,30.032,30.032v120.13c0,16.585-13.445,30.032-30.032,30.032c-16.587,0-30.032-13.448-30.032-30.032v-120.13h0C225.966,135.539,239.412,122.094,255.999,122.094z M255.999,422.417c-24.841,0-45.049-20.208-45.049-45.049c0-24.841,20.208-45.049,45.049-45.049c24.841,0,45.049,20.208,45.049,45.049C301.047,402.21,280.84,422.417,255.999,422.417z"/></g></g></svg>',
    close: '<svg viewBox="0 0 365.696 365.696" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0" /></svg > ',
    chevronDown: '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 444.819 444.819" xml:space="preserve"><g><path fill="white" d="M434.252,114.203l-21.409-21.416c-7.419-7.04-16.084-10.561-25.975-10.561c-10.095,0-18.657,3.521-25.7,10.561L222.41,231.549L83.653,92.791c-7.042-7.04-15.606-10.561-25.697-10.561c-9.896,0-18.559,3.521-25.979,10.561l-21.128,21.416C3.615,121.436,0,130.099,0,140.188c0,10.277,3.619,18.842,10.848,25.693l185.864,185.865c6.855,7.23,15.416,10.848,25.697,10.848c10.088,0,18.75-3.617,25.977-10.848l185.865-185.865c7.043-7.044,10.567-15.608,10.567-25.693C444.819,130.287,441.295,121.629,434.252,114.203z"/></g></svg>'
};

/*
 * Define a simple stylesheet to be injected into the jhead for building the plugin UI
 */
const insightPluginStyleCss = `
#insightPluginDisplayBox {
    display: block;
    width: 320px;
    position: fixed;
    bottom: 98px;
    right: 36px;
    z-index: 998;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgb(0, 0, 0, 0.19);
}

#insightPluginIcon {
    width: 64px;
    height: 64px;
    position: fixed;
    bottom: 82px;
    right: 20px;
    z-index: 999;
    display: none;
    background-color: rgb(216, 17, 89);
    background-image: url('data:image/svg+xml; utf8, ${insightPluginIconStore.alert}');
    background-size: 32px;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 5px;
    box-shadow: 0 8px 6px -6px rgba(0, 0, 0, 0.5);
}

#insightPluginIcon.bounce {
    animation: insightPluginBounceAnimation 4s 4 !important;
}

@keyframes insightPluginBounceAnimation {
    10%,
    20%,
    30%,
    40%,
    50% {
        transform: translateY(0);
    }
    15% {
        transform: translateY(-30px);
    }
    25% {
        transform: translateY(-15px);
    }
    35% {
        transform: translateY(-5px);
    }
    45% {
         transform: translateY(-2px);
    }
}

#insightPluginIcon.show {
    cursor: pointer;
    display: block;
    animation: insightPluginPulseAnimation 0.5s ease-in 1;
}

@keyframes insightPluginPulseAnimation{
    25%  {transform: scale(0.9);}
    75%  {transform: scale(1.1);}
}

#insightPluginIcon.open {
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    background-image: url('data:image/svg+xml; utf8, ${insightPluginIconStore.chevronDown}');
}

#insightPluginIcon.opened {
    animation: none !important;
}

#insightPluginContentWrapper {
    position: relative;
    width: 320px;
    height: 0;
    background-color: #fff;
    overflow: hidden;
    transition: all 0.5s ease 0s;
    z-index: -1;
}
#insightPluginContentWrapper.show {
    height: 480px;
}
#insightPluginTitleBar {
    background-image: url('data:image/svg+xml; utf8, ${insightPluginIconStore.close}');
    background-size: 16px;
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-color: rgb(1, 65, 109);
    height: 42px;
}

#insightPluginTitleBar h4 {
    height: 42px;
    line-height: 42px;
    color: white;
    margin: 0;
    padding: 0 0 0 12px;
    text-align: left;
}

#insightPluginContentFrame {
    padding: 12px;
    overflow-x: hidden;
    overflow-y: auto;
    height: 438px;
}

#insightPluginContentFrame p {
    font-size: 12px;
}

#insightPluginContentFrame ul {
    margin-left: 24px;
}

.insightPluginAlertSeverity-5 {
    color: rgb(216, 17, 89);
}

.insightPluginAlertSeverity-4 {
    color: rgb(255, 115, 0);
}
`;

/*
 * Function to wrap insightPluginLog() to easily enable/disable logging
 */
function insightPluginLog(msg) {
    if (insightPluginDebug) {
        console.log(msg)
    }
}

/*
 * Function to check if the document is fully loaded.
 * Based on JQuery $(document).ready()
 */
(function (funcName, baseObj) {
    // The public function name defaults to window.insightPluginDocReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "insightPluginDocReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the insightPluginDocReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    // This is the one public interface
    // insightPluginDocReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function (callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for insightPluginDocReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () { callback(context); }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({ fn: callback, ctx: context });
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // first choice is DOMContentLoaded event
            document.addEventListener("DOMContentLoaded", ready, false);
            // backup is window load event
            window.addEventListener("load", ready, false);
            readyEventHandlersInstalled = true;
        }
    }
})("insightPluginDocReady", window);


/*
 * Function to build the insight UI components
 */
function insightPluginApiBuildUi() {
    // Inject the insight-plugin CSS stylesheet the page head element
    let insightPluginStyleElem = document.createElement('style');
    insightPluginStyleElem.textContent = insightPluginStyleCss;
    document.head.append(insightPluginStyleElem);

    // Add plugin icon to bottom right corner of page; hidden by default
    let insightPluginIcon = document.createElement('div');
    insightPluginIcon.id = "insightPluginIcon";
    document.body.appendChild(insightPluginIcon);
    //insightPluginIcon.innerHTML = insightPluginIconStore.alert;

    // Build plugin display panel; hidden by default
    let insightPluginDisplayBox = document.createElement('div');
    insightPluginDisplayBox.id = "insightPluginDisplayBox";
    document.body.appendChild(insightPluginDisplayBox);

    // Build content wrapper
    let insightPluginContentWrapper = document.createElement('div');
    insightPluginContentWrapper.id = "insightPluginContentWrapper";
    insightPluginDisplayBox.appendChild(insightPluginContentWrapper);

    // Build two divs inside the content wrapper.
    let insightPluginTitleBar = document.createElement('div');
    insightPluginTitleBar.id = 'insightPluginTitleBar';
    let insightPluginContentFrame = document.createElement('div');
    insightPluginContentFrame.id = 'insightPluginContentFrame';

    insightPluginContentWrapper.appendChild(insightPluginTitleBar);
    insightPluginContentWrapper.appendChild(insightPluginContentFrame);
    insightPluginTitleBar.innerHTML += '<h4><strong>CFC Insight</strong> Data Feed</h4>';

    // Define a function for opening and closing the plugin
    function insightPluginToggler() {
        insightPluginContentWrapper.classList.toggle('show');
        insightPluginIcon.classList.toggle('open');
        // Prevent animation from triggering again
        insightPluginIcon.classList.add('opened');
    };

    // Add the trigger to icon open and close the plugin
    insightPluginIcon.addEventListener('click', function (e) {
        e.preventDefault();
        insightPluginToggler();
    });

    // Add the trigger to title bar for open and close the plugin
    insightPluginTitleBar.addEventListener('click', function (e) {
        e.preventDefault();
        insightPluginToggler();
    });   
}


/*
 * Function to handle HTTP request to the local-network insight API proxy.
 * Auth is provided via static token, and also at the network/dns level.
 */
function insightPluginApiRequest(params, callback) {
    let url = `https://${insightClientAlertsHost}/api/alerts?correlation_id=${params.correlation_id}`;
    if (params.enquiry_id) {
        url += '&enquiry_id=' + params.enquiry_id
    } else if (params.quote_ref) {
        url += '&quote_ref=' + params.quote_ref
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status === 202 || xhr.status === 409) {
                setTimeout(() => { insightPluginApiRequest(params, callback); }, 5000);
            } else {
                insightPluginLog(xhr.responseText);
                callback(JSON.parse(xhr.responseText));
            }
        }
    }
    xhr.send(null);
}

/*
 * Function to display the plugin icon.
 */
function insightPluginRenderData(data) {
    insightPluginLog('Rendering data')
    if (data.hasOwnProperty('error')) {
        insightPluginLog('Error: ' + data.error);
    } else if (data.alerts == null || data.alerts.length == 0) {
        insightPluginLog('No alerts to display');
    } else {
        let insightPluginIcon = document.getElementById('insightPluginIcon');
        // Show the plugin icon
        insightPluginIcon.classList.add('show');
        insightPluginRenderAlerts(data.alerts);
        // After a 1.2 second delay, start bouncing
        setTimeout(() => {
            insightPluginIcon.classList.add('bounce')
        }, 1200)
    }
}

/*
 * Function to populate the alerts content
 */
function insightPluginRenderAlerts(alerts) {
    let insightPluginContentFrame = document.getElementById('insightPluginContentFrame');
    alerts.forEach(item => {
        insightPluginContentFrame.innerHTML += `
            <h4 class="insightPluginAlertSeverity-${item.severity}"><strong>Alert</strong>: ${item.name}</h4>
            <p>
                ${item.description}
                <ul>
                    ${item.items.map(host => `<li>${host}</li>`).join("")}
                </ul>
            </p>
                ${insightGetExplanationParagraphs(item.explanation)}
            <hr>
        `;
    });
}

/*
 * Function for formatting the explanation paragraph text and make the first item bold
 */
function insightGetExplanationParagraphs(explanationList) {
    if (explanationList !== undefined && explanationList !== null) {
        return explanationList.map((explanation, index) => {
            if (index === 0) {
                return `<p><strong>${explanation}</strong></p>`;
            } else {
                return `<p>${explanation}</p>`;
            }
        }).join("");
    } else {
        return "";
    }
}

/*
 * Utility function to generate a unique correlation id
 */
function insightGetUuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/*
 * The main function to call when ready.
 * 
 * 1. Checks to see if the URL parameters meet the requirments to trigger the insight plugin.
 * 2. Makes HTTP requests for a given enquiryId to the Insight API proxy.
 * 3. Inject the insight widget and content from the API responses.
 */
function insightPluginMain() {
    insightPluginLog('Running CFC Insight Plugin');
    let urlParams = new URLSearchParams(window.location.search);
    // Only trigger on the /quote uri when we have a valid enquiryId
    if (window.location.pathname == '/quote') {
        // Build the UI
        insightPluginApiBuildUi();

        let correlation_id = insightGetUuid();
        insightPluginLog('Alert correlation id: ' + correlation_id);
        let apiRequestParams = {
            correlation_id: correlation_id,
            enquiry_id: null,
            quote_ref: null
        };

        if (urlParams.has('enquiryId')) {
            // Set the enquiryId from URL param string
            let enquiryId = String(urlParams.get('enquiryId'));
            insightPluginLog('insightPlugin detected enquiryId: ' + enquiryId);
            apiRequestParams.enquiry_id = enquiryId;
        } else if (urlParams.has('quoteRef')) {
            // Set the quoteRef from URL param string
            let quoteRef = Number(urlParams.get('quoteRef'));
            insightPluginLog('insightPlugin detected quoteRef: ' + quoteRef);
            apiRequestParams.quote_ref = quoteRef;
        } else {
            insightPluginLog('No valid URL params.');
            return;
        }

        // Call the insight API
        insightPluginApiRequest(apiRequestParams, insightPluginRenderData)

    } else {
        insightPluginLog('insightPlugin not required')
    }
};


/*
 * Run the insightPluginMain function when the document is fully loaded.
 */
insightPluginDocReady(insightPluginMain);
