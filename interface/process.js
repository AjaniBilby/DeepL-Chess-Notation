let opts = [
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
	"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR",
	"rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R"
];

function Process() {
	DisableUI(true);
	setTimeout(()=>{
		let move = opts[Math.floor(Math.random()*opts.length)];

		results.innerHTML = results.value + move + "&#13;&#10;";
		DisableUI(false);
	}, 1000);
}