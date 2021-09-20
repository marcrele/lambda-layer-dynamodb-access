import * as dynamodb from "../../main/nodejs/index";

describe("todos", () => {
  it("should insert item into table", async () => {
    await dynamodb.insertOrReplace("todos", {
      id: "123",
      other: "321",
      name: "new todo",
      hello: "world",
    });

    const item = await dynamodb.find("todos", { id: "123" });

    expect(item).toEqual({
      id: "123",
      other: "321",
      name: "new todo",
      hello: "world",
    });
  });

  it("should uptate the first item", async () => {
    await dynamodb.update(
      "todos",
      { id: "111" },
      {
        other: "222",
        name: "updated todo",
        hello: "first",
      }
    );

    const item = await dynamodb.find("todos", { id: "111" });

    expect(item).toEqual({
      id: "111",
      other: "222",
      name: "updated todo",
      hello: "first",
      toRemove: "remove me"
    });
  });

  it("should remove a field of the first item", async () => {
    await dynamodb.update(
      "todos",
      { id: "111" },
      {
        other: "222",
        name: "updated todo",
        hello: "first",
        toRemove: null
      }
    );

    const item = await dynamodb.find("todos", { id: "111" });

    expect(item).toEqual({
      id: "111",
      other: "222",
      name: "updated todo",
      hello: "first",
    });
  });
});
