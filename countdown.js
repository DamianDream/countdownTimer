
document.addEventListener("DOMContentLoaded", () => {

const getElement = (selector, node = document.body) => {
	// function expect selector and optional node
	try {
		const el = node.querySelector(selector);
		if (!el) console.warn(`Could not find element by selector: `, selector);
		return el
	} catch (error) {
		console.error("getElement: ", error);
	}
}

const getAllElements = (selector) => {
	try {
		const elements = document.body.querySelectorAll(selector);
		if (!elements) console.warn(`Could not find element by selector: `, selector);
		return elements
	} catch (error) {
		console.error("getElement: ", error);
	}
}

const getEndOfNextDay = () => {
	// get the date of next day (add to current day +1day 23hours 59minutes 59seconds)
	const now = new Date();
	const endOfNextDay = new Date(
		now.getFullYear(), 
		now.getMonth(), 
		now.getDate() + 1, 23, 59, 59, 999);
  return endOfNextDay;
}

//helper function to add zero
const getZero = (num) => (num >= 0 && num < 10) ? `0${num}`: num;

const isValidDate = (value) => {
	// check is value can be parsed as date object
	const date = new Date(value)
	if (!isNaN(date) && date instanceof Date) return date

	console.warn("Please check, date is not valid format: ", value);
  return false
};

const isOutOfDate = (value) => {
	if (!value) return
	// check is provided custom date not expired
	return (Date.parse(value) - new Date(new Date()) > 0)
};

const getTimeRemaining = (customDate) => {
	if(!customDate) return

	const distance = Date.parse(customDate) - new Date(new Date()),
		days = Math.floor(distance / (1000 * 60 * 60 * 24)),
		hours = Math.floor((distance / (1000 * 60 * 60)) % 24),
		minutes = Math.floor((distance / 1000 / 60) % 60),
		seconds = Math.floor((distance / 1000) % 60);

	return { distance, days, hours, minutes, seconds };
}

const animateValue = (node, end, start = 0, duration = 1000 ) => {
	// Usage:  animateValue(".class-name", 1000, 0, 1000);
	let startTimestamp = null;
	const step = (timestamp) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		node.innerHTML = getZero(Math.floor(progress * (end - start) + start));
		if (progress < 1) {
			window.requestAnimationFrame(step);
		}
	};
	window.requestAnimationFrame(step);
};


	// const deadline = getEndOfNextDay(); 
	/*
		Date format for config.deadline "YYYY-MM-DD"
		Date can be edit several in way: 
		"2024-09-29 01:00:00 UTC+3"
	*/
	const config = {
		deadline: "2024-10-24 00:00:00",
		selectors: {
			countdown: '[dataset-countdown]',
			day: '[dataset-countdown-timer="day"]',
			hour: '[dataset-countdown-timer="hour"]',
			minute: '[dataset-countdown-timer="minute"]',
			second: '[dataset-countdown-timer="second"]',
			title: '[dataset-countdown-timer="title"]',
		},
		text: {
			timeExpired: "Time has passed",
		}
	};

	const countdownHandler = (config) => {
	
		// Check if provided date is valid
		if(!isValidDate(config.deadline) && isOutOfDate(config.deadline)) {
			headerTitleNode.firstChild.textContent = config.text.timeExpired;
			return
		}

		const countdownNode = getElement(config.selectors.countdown),
					dayNode = getElement(config.selectors.day, countdownNode),
					hourNode = getElement(config.selectors.hour, countdownNode),
					minuteNode = getElement(config.selectors.minute, countdownNode),
					secondNode = getElement(config.selectors.second, countdownNode),
					headerTitleNode = getElement(config.selectors.title, countdownNode);

		
		const updateCountdown = () => {

			const t = getTimeRemaining(config.deadline); //remaining time

			if (t.distance >= 0) {
				dayNode.innerHTML = getZero(t.days);
				hourNode.innerHTML = getZero(t.hours);
				minuteNode.innerHTML = getZero(t.minutes);
				secondNode.innerHTML = getZero(t.seconds);
			} 
			
			if (t.distance <= 0) {
				if (typeof interval !== 'undefined') clearInterval(timeInterval);

				// Indicate user that time is expired
				headerTitleNode.firstChild.textContent = config.text.timeExpired;
			}
		}				

		// Action on observer (start action when elements in view)
		const countdownObserver = new IntersectionObserver(entries => {
				entries.forEach(entry => {

						if (entry.isIntersecting) {
							setTimeout(() => {
								const t = getTimeRemaining(config.deadline);
								if (t.distance >= 0) {
									animateValue(dayNode, t.days);
									animateValue(hourNode, t.hours);
									animateValue(minuteNode, t.minutes);
									animateValue(secondNode, t.seconds);
								} 
								
								setTimeout(()=>{
									const timeInterval = setInterval(updateCountdown, 1000);
								}, 500);
							}, 500);
						}

						// Stop observing the element "run once"
						if (entry.isIntersecting) countdownObserver.unobserve(entry.target);
				}, {threshold: 1,})
		});
		countdownObserver.observe(countdownNode);
	}
	
	countdownHandler(config);
})


