for (var i = 0; i < 25; i++) {
	window.mainMenuAPI.buttons.push({
		text: "Test button " + i,
		runnable: () => {
			alert("*pets Lea cutely*");
		}
	});
}
