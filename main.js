// This script fetches all messages from the bottom of the viewport and deletes all the way to the top of the conversation
// It is primarily used to delete ALL of your messages in a conversation, however, some code adjustments can make it stop wherever you want
// The following are the steps to delete ONE message on Instagram:
// (1) Hover beside each message for the 3 dots to appear
// (2) Click the "More" button (the three dots)
// (3) Click the "Unsend" button
// (4) Click "Unsend" again once the confirmation popup appears

load = true; // When set to false after loadChat() has been called, breaks out of the function's while loop (i.e. stops loading the chat)
del = true; // When set to false after deleteChat() has been called, breaks out of the function's while loop (i.e. stops deleting the conversation)
delReact = true; // When set to false, deleteReaction() does not run (this is useful when you're blocked and are unable to remove reactions)

// Memory variables for resume functionality
let lastProcessedMessage = null; // Stores the last successfully processed message
let resumeFromMessage = null; // Determines where to resume from after interruption
let processedMessages = new Set(); // Tracks processed messages to avoid duplicates

loadChat();
// deleteChat();

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Loads chat by constantly scrolling to the top until all messages are loaded
async function loadChat() {
	// Getting the div of the conversation
	let conversationWindow = document.getElementsByClassName(
		"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1odjw0f x1n2onr6 xh8yej3 x16o0dkt"
	)[1]; // Returns 2 elements, [0] is the div of all conversations, [1] is the div of current conversation
	
	let lastScrollTop = conversationWindow.scrollTop;
	let samePositionTime = 0; // To track how long the scrollTop hasn't changed

	while (load) {
		conversationWindow.scrollTo(0, 0);
		await delay(250); // Add delay to prevent breaking the program with instant function calls

		// Check if the scrollTop has changed (if we're still loading content)
		if (conversationWindow.scrollTop === lastScrollTop) {
			samePositionTime += 250; // Increment the same position time
		} else {
			samePositionTime = 0; // Reset if the scrollTop changes (new content loaded)
		}

		// If the scrollTop hasn't changed for 3 seconds, break out of the loop (all content loaded)
		if (samePositionTime >= 3000) {
			break;
		}

		lastScrollTop = conversationWindow.scrollTop; // Update the last scrollTop value
	}
	// Once chat is fully loaded, scroll to the bottom to start deletion from newest messages
	conversationWindow.scrollTo(0, conversationWindow.scrollHeight);
	await delay(100);
	deleteChat();
}

// Processes and deletes messages one by one from bottom to top
async function deleteMessages(conversation, messages) {
	// Find where to start processing messages (resume from last position or start from bottom)
	let startIndex = messages.length - 1;
	if (resumeFromMessage) {
		// If we have a resume point, find that message in the current message list
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i] === resumeFromMessage) {
				startIndex = i - 1; // Start from the message before the last processed one
				break;
			}
		}
		// If message not found in current list, start from the bottom
		if (startIndex >= messages.length) {
			startIndex = messages.length - 1;
		}
	}

	// Process messages from determined start point to top (index 0)
	for (let i = startIndex; i >= 0; i--) {
		let currentMessage = messages[i];
		
		// Skip this message if it has already been processed (avoid duplicates)
		if (processedMessages.has(currentMessage)) {
			continue;
		}

		let scrolled = false; // Track if we scrolled for this message

		// Skip if message is below viewport (not visible)
		if (currentMessage.getBoundingClientRect().top > window.innerHeight - 77) {
			continue;
		}

		let conversationWindow = document.getElementsByClassName(
			"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1odjw0f x1n2onr6 xh8yej3 x16o0dkt"
		)[1];

		// Skip messages with only one class (likely system or non-deletable messages)
		if (currentMessage.classList.length === 1) {
			conversationWindow.scrollBy(0, -50);
			scrolled = true;
			continue;
		}

		// Check if the currentMessage is above the viewport and needs scrolling into view
		let currentMessagePosition = currentMessage.getBoundingClientRect();
		if (currentMessagePosition.top - 75 < 0) {
			currentMessage.scrollIntoView();
			scrolled = true;
			await delay(75); // Wait for the scroll action to complete
		}

		// STEP (1): Hover beside the message to make options appear
		currentMessage.dispatchEvent(
			new MouseEvent("mouseover", {
				view: window,
				bubbles: true,
				cancelable: true,
			})
		);
		await delay(25);

		// STEP (2): Check for available options (React, Reply, More)
		let options = currentMessage.getElementsByClassName("x6s0dn4 x78zum5 xdt5ytf xl56j7k");
		if (options.length === 0) {
			// If no options available (like photo messages), click conversation and handle reactions
			conversation.click();
			await deleteReaction(currentMessage);
			
			// Mark message as processed and save position
			processedMessages.add(currentMessage);
			lastProcessedMessage = currentMessage;
			continue;
		}

		let option = options[options.length - 1];
		// Check if the option includes "More" button (required for deletion)
		if (!option.querySelector("title").textContent.toLowerCase().includes("more")) {
			// If no "More" option, click conversation and handle reactions
			conversation.click();
			await deleteReaction(currentMessage);
			
			// Mark message as processed and save position
			processedMessages.add(currentMessage);
			lastProcessedMessage = currentMessage;
			continue;
		}

		// Click the "More" button to open message options
		option.click();
		await delay(25);

		// STEP (3): Handle the options menu that appears
		let moreUI = document.getElementsByClassName(
			"html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 xjbqb8w x78zum5 x15mokao x1ga7v0g x16uus16 xbiv7yw x1uhb9sk x1plvlek xryxfnj x1iyjqo2 x2lwn1j xeuugli xdt5ytf xqjyukv x1cy8zhl x1oa3qoh x1nhvcw1"
		);
		let button = moreUI[moreUI.length - 1];
		let unsendOrReport = button.querySelector("span").getElementsByClassName("x1lliihq x193iq5w x6ikm8r x10wlt62 xlyipyv xuxw1ft");

		// Check if "Unsend" option is available (user's own message)
		if (unsendOrReport[0].innerText === "Unsend") {
			// STEP (4): Execute the deletion process
			button.click(); // Click "Unsend"
			await delay(75);
			// Click confirmation "Unsend" button in popup
			document
				.getElementsByClassName(
					"xjbqb8w x1qhh985 x10w94by x14e42zd x1yvgwvq x13fuv20 x178xt8z x1ypdohk xvs91rp x1evy7pa xdj266r x14z9mp xat24cr x1lziwak x1wxaq2x x1iorvi4 xf159sx xjkvuk6 xmzvs34 x2b8uid x87ps6o xxymvpz xh8yej3 x52vrxo x4gyw5p xkmlbd1 x1xlr1w8"
				)[0]
				.click();
			
			// After successful deletion: save position for resume capability
			await delay(100); // Wait for deletion to complete
			processedMessages.add(currentMessage);
			lastProcessedMessage = currentMessage;
			resumeFromMessage = currentMessage; // Update resume point
			
			// Add short delay between deletions to avoid rate limiting
			await delay(200);
		} else {
			// If "Unsend" not available (not user's message), focus conversation and handle reactions
			conversation.click();
			await delay(50);
			await deleteReaction(currentMessage);
			
			// Mark message as processed and save position
			processedMessages.add(currentMessage);
			lastProcessedMessage = currentMessage;
		}
		
		// Scroll slightly if we didn't scroll for this message
		if (!scrolled) conversationWindow.scrollBy(0, -30);
	}
}

// Removes reactions from a single message if present
async function deleteReaction(lastMessage) {
	try {
		if (delReact) {
			// Check if message has a reaction (like) from current user
			let checkReaction = lastMessage.getElementsByClassName(
				"x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"
			);
			if (checkReaction.length > 0) {
				reaction = checkReaction[0];
				reaction.click(); // Click the reaction
				await delay(25);
				
				// Find the reaction popup dialog
				let popupConfirmation = document.getElementsByClassName(
					"x1ja2u2z x1afcbsf x1a2a7pz x6ikm8r x10wlt62 x71s49j x6s0dn4 x78zum5 xdt5ytf xl56j7k x1n2onr6"
				);
				popupConfirmation = popupConfirmation[popupConfirmation.length - 1];
				
				// Find and click the reaction removal option if available
				let spans = popupConfirmation.getElementsByClassName(
					"x1lliihq x1plvlek xryxfnj x1n2onr6 xyejjpt x15dsfln x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1i0vuye xvs91rp xo1l8bm x1roi4f4 x1tu3fi x3x7a5m x10wh9bi xpm28yp x8viiok x1o7cslx"
				);
				// Spans could be empty if other people liked the message but not current user
				if (spans.length > 0) {
					spans[spans.length - 1].click(); // Click to remove reaction
					await delay(25);
				}

				// Close the reaction popup
				let close = popupConfirmation.querySelector('[aria-label="Close"]');
				if (close) close.click();
				await delay(25);
			}
		}
	} catch {
		// Retry if reaction deletion fails
		deleteReaction(lastMessage);
	}
}

// Main deletion controller - manages the overall deletion process
async function deleteChat() {
	try {
		while (del) {
			let conversation = document.getElementsByClassName(
				"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1odjw0f x1n2onr6 xh8yej3 x16o0dkt"
			)[1];
			let messages = conversation.querySelectorAll('[data-release-focus-from="CLICK"]');
			await deleteMessages(conversation, messages); // Process current batch of messages

			let conversationWindow = document.getElementsByClassName(
				"x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1odjw0f x1n2onr6 xh8yej3 x16o0dkt"
			)[1];
			// Check if we are at the top of the conversation (all messages processed)
			if (conversationWindow.scrollTop <= 1) {
				break; // Exit loop when all messages are deleted
			}
		}
	} catch {
		// On error: resume from last successfully processed message
		resumeFromMessage = lastProcessedMessage;
		deleteChat(); // Retry deletion process
	}
}

// Manual resume function - can be called externally to continue deletion
function resumeDeletion() {
	resumeFromMessage = lastProcessedMessage;
	deleteChat();
}

// Clear memory when page refreshes to avoid stale data
window.addEventListener('beforeunload', function() {
	lastProcessedMessage = null;
	resumeFromMessage = null;
	processedMessages.clear();
});
