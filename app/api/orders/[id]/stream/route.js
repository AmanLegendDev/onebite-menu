import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  return new Response(
    new ReadableStream({
      async start(controller) {
        let closed = false;

        const send = (order) => {
          if (closed) return;
          controller.enqueue(
            `data: ${JSON.stringify({ order })}\n\n`
          );
        };

        // 1️⃣ Initial emit
        const initialOrder = await Order.findById(id).lean();
        if (!initialOrder) {
          controller.close();
          return;
        }
        send(initialOrder);

        // 2️⃣ POLLING fallback (100% reliable)
        const poll = setInterval(async () => {
          const latest = await Order.findById(id).lean();
          if (latest) send(latest);
        }, 2000);

        // 3️⃣ Try Mongo Change Stream (optional boost)
        let mongoStream;
        try {
          mongoStream = Order.watch(
            [{ $match: { "fullDocument._id": initialOrder._id } }],
            { fullDocument: "updateLookup" }
          );

          mongoStream.on("change", (change) => {
            if (change.fullDocument) {
              send(change.fullDocument);
            }
          });
        } catch (err) {
          console.log("ChangeStream not supported, fallback active");
        }

        // 4️⃣ Cleanup on client close
        req.signal.addEventListener("abort", () => {
          closed = true;
          clearInterval(poll);
          mongoStream?.close();
          controller.close();
        });
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}