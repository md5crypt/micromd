import { createStyles, flushStyles } from "./createStyles";
import { MainComponent } from "./MainComponent";

createStyles({
	"@global": {
		body: {
			padding: "0",
			margin: "0",
			height: "100vh",
			width: "100vw",
			overflow: "hidden",
			backgroundColor: "#f6f6f6"
		}
	}
})

flushStyles()

new MainComponent().createOrphanized(document.body)
