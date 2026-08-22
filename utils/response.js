export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const unauthorized = () =>
  json({ error: "Unauthorized" }, 401);
