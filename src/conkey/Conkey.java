package conkey;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Paths;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import org.apache.log4j.BasicConfigurator;

public class Conkey extends Spark {

	public static Map<String, Object> staticpages = new HashMap();

	public static String getLocalTextFile(File file) throws IOException {
		int len;
		char[] chr = new char[4096];
		final StringBuffer buffer = new StringBuffer();
		final FileReader reader = new FileReader(file);
		try {
			while ((len = reader.read(chr)) > 0) {
				buffer.append(chr, 0, len);
			}
		} finally {
			reader.close();
		}
		return buffer.toString();
	}

	public static void getLocalBinaryFile(File file, OutputStream os) throws IOException {

		byte[] buf = new byte[1024];
		FileInputStream in = new FileInputStream(file);

		OutputStreamWriter out = new OutputStreamWriter(os);
		int count = 0;
		while ((count = in.read(buf)) >= 0) {
			os.write(buf, 0, count);
		}
		in.close();
		out.close();

	}

	public static String getStaticTextFile(String path) throws IOException {
		if (staticpages.containsKey(path)) {
			return (String) staticpages.get(path);
		}
		String content = getLocalTextFile(new File("./web/" + path));
		staticpages.put(path, content);
		return content;
	}

	public static void getStaticBinaryFile(String path, OutputStream os) throws IOException {
		getLocalBinaryFile(new File("./web/" + path), os);
	}

	public static void main(String[] args) {

		BasicConfigurator.configure();	// configures log4j logger

		Integer portNumber = 9090;			// Spark will run on port 9090
		setPort(portNumber);

		System.out.println("YKY set port to: " + portNumber.toString() + "\n");

		// This route seems to be old
		Route saveDatabase;

		post(new Route("/saveDatabase/:fname") {
			@Override
			public Object handle(Request rqst, Response rspns) {
				// System.out.println("saving database....");
				rspns.header("Content-type", "text/html");
				// String list = rqst.queryParams().toString();
				String fname = rqst.params(":fname").toString();
				// System.out.println("params are: " + list);
				String data = rqst.queryParams("data").toString();
				// System.out.println("data is: " + data.substring(0, 100));
				try {
					// Save in web/ directory
					PrintWriter out = new PrintWriter("web/" + fname);
					out.print(data);
					out.close();
				} catch (FileNotFoundException ex) {
					Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
				}
				return "Database saved";
			}
		});

		// Route sendPidginMessage;

		post(new Route("/sendPidginMessage/:name") {
			@Override
			public Object handle(Request rqst, Response rspns) {
				// System.out.println("saving database....");
				rspns.header("Content-type", "text/html");
				// String list = rqst.queryParams().toString();
				String name = rqst.params(":name").toString();
				System.out.println("param is: " + name);
				String data = rqst.queryParams("data").toString();
				System.out.println("data is: " + data);
				try {
					// Send to Pidgin
					Process p = Runtime.getRuntime().exec("/home/yky/NetbeansProjects/conceptual-keyboard/pidgin-message.py " + name + " " + data);
				} catch (IOException ex) {
					Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
				}
				return "Pidgin message sent\n";
			}
		});

		// Route saveChatLog;

		post(new Route("/saveChatLog/:name") {
			@Override
			public Object handle(Request rqst, Response rspns) {
				// System.out.println("saving database....");
				rspns.header("Content-type", "text/html");
				// String list = rqst.queryParams().toString();
				String fname = rqst.params(":name").toString();
				System.out.println("param is: " + fname);
				String data = rqst.queryParams("data").toString();
				// System.out.println("data is: " + data);
				System.out.println("data obtained.");
				
				// Save file to local directory
				File file = new File("/home/yky/logs/" + fname);
				try{
					Writer output = new BufferedWriter(new FileWriter(file));

					output.write(data);

					output.close();
					System.out.println("Chat history written.\n");

					} catch(Exception e){
						 System.out.println("Cannot create file.\n");
					}
				return "Chat history saved";
			}
		});

		get(new Route("/getPidginNames/*") {
			@Override
			public Object handle(Request rqst, Response rspns) {
				rspns.header("Content-type", "text/html; charset=utf-8");
				try {
					Process p = Runtime.getRuntime().exec("/home/yky/NetbeansProjects/conceptual-keyboard/pidgin-names.py");
				} catch (IOException ex) {
					Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
				}
				System.out.println("Executed shell script pidgin-names.py.\n");

				String pidginNames = "";
				try {
					pidginNames = new String(Files.readAllBytes(Paths.get("/home/yky/NetbeansProjects/conceptual-keyboard/pidgin-names.txt")));
				} catch (IOException ex) {
					Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex);
				}
				System.out.println("Read file pidgin-names.txt.\n");
    			return pidginNames;
			}
		});
		

		
		
		get(new Route("/*") {
			@Override
			public Object handle(Request rqst, Response rspns) {

				String url = rqst.pathInfo();
				String page = "index.html";
				if (!url.equals("/")) {
					String xpage = url.substring(url.indexOf("/") + 1);
					if (page.length() > 0) {
						page = xpage;
					}
				}

				System.out.println(rqst.pathInfo());
				System.out.println(rqst.url() + " -> " + page);

				try {
					if        (page.endsWith(".jpg")) {
						rspns.header("Content-type", "image/jpg");
						rspns.header("Cache-Control", "no-cache");
						getStaticBinaryFile(page, rspns.raw().getOutputStream());
						return null;
					} else if (page.endsWith(".png")) {
						rspns.header("Content-type", "image/png");
						getStaticBinaryFile(page, rspns.raw().getOutputStream());
						return null;
					} else if (page.endsWith(".ogg")) {
						rspns.header("Content-type", "audio/ogg");
						getStaticBinaryFile(page, rspns.raw().getOutputStream());
						return null;
					} else if (page.endsWith(".gif")) {
						rspns.header("Content-type", "image/gif");
						getStaticBinaryFile(page, rspns.raw().getOutputStream());
						return null;
					} else if (page.endsWith(".ico")) {
						rspns.header("Content-type", "image/x-icon");
						getStaticBinaryFile(page, rspns.raw().getOutputStream());
						return null;
					} else if (page.endsWith(".html") || page.endsWith(".htm")) {
						rspns.header("Content-type", "text/html; charset=utf-8");
						return getStaticTextFile(page);
					} else {
						return getStaticTextFile(page);
					}
				} catch (IOException ex) {
					try {
						halt(404, getStaticTextFile("404.html"));
					} catch (IOException ex1) {
						Logger.getLogger(Conkey.class.getName()).log(Level.SEVERE, null, ex1);
					}
				}
				return null;
			}
		});
		

		
	}
}
