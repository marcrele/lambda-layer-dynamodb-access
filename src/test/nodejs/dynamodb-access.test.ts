import * as dynamodb from "../../main/nodejs/index";

it("should insert item into table", async () => {
  await dynamodb.insertOrReplace("todos", {
    id: "123",
    other: "321",
    hello: "world",
  });

  const item = await dynamodb.find("todos", "123");

  expect(item).toEqual({
    id: "123",
    other: "321",
    hello: "world",
  });
});
