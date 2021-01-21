import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import java.net.Socket;

public class SimpleClient {

	private static BufferedReader inSocket;
	private static BufferedReader outSocket;
	
    public static void main(String args[]) {
        try {
            Socket client_socket = new Socket("127.0.0.1", 9091);

            // Used to read from a terminal input:
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

            // Used for client/server communication:
            inSocket = new BufferedReader(new InputStreamReader(client_socket.getInputStream()));
            outSocket = new BufferedWriter(new OutputStreamWriter(client_socket.getOutputStream()));

        }
        catch(Exception e) {
            e.printStackTrace();
        }

		System.out.print("client says: ");
		String msg = br.readLine();

		// Send:
		out.write(msg);
		out.newLine();
		out.flush();

		while(true) {
			// Receive:
			int ifirst_char;
			char first_char;

			if((ifirst_char = in.read()) == -1) {  // Server Closed
				System.out.println("Server was closed on the other side.");
				break;
			}

			first_char = (char) ifirst_char;
			msg = String.valueOf(first_char);
			msg += in.readLine();

			// Shows the message received from the server on the screen:
			System.out.println(msg);
		}
    }
}
