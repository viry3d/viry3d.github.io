export class File {
	private static Request(type: string, path: string, finish: (data: any) => void, progress: (e: ProgressEvent) => void) {
		let request = new XMLHttpRequest();
		if(request != null) {
			request.onreadystatechange = () => {
				if(request.readyState == 4) {
					if(request.status == 200) {
						if(type == "xml") {
							let xml = request.responseXML;
							if(xml != null) {
								finish(xml);
							} else {
								finish(null);
								console.error("File.Request failed", path, type);
							}
						} else {
							finish(request.response);
						}
					} else {
						finish(null);
						console.error("File.Request failed", path, type);
					}
				}
			};

			request.onprogress = function(e: ProgressEvent) {
				if(e.lengthComputable && progress != null) {
					progress(e);
				}
			};

			request.open("GET", path, true);

			if(type == "xml") {
				request.overrideMimeType("text/xml");
			} else {
				try {
					request.responseType = type;
				} catch(e) { }
			}

			request.send(null);
		} else {
			alert("browser does not support XMLHttpRequest");
		}
	}

	static ReadXml(path: string, finish: (xml: XMLDocument) => void) {
		File.Request("xml", path, finish, null);
	}

	static ReadAllBytes(path: string, finish: (bytes: ArrayBuffer) => void, progress: (e: ProgressEvent) => void = null) {
		File.Request("arraybuffer", path, finish, progress);
	}

	static ReadAllText(path: string, finish: (text: string) => void) {
		File.Request("text", path, finish, null);
	}

	static WriteAllText(path: string, text: string) {
	}

	static Exist(path: string): boolean {
		return false;
	}
}