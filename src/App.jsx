import { useEffect, useState } from "react";
import "./App.css";
// async await
async function fecthAllTodos() {
  const res = await fetch("https://6531befe4d4c2e3f333d41d1.mockapi.io/todo");
  const data = await res.json();

  return data;
}

async function deleteTodoById(id) {
  const res = await fetch(
    // check https://documenter.getpostman.com/view/8970478/2s9YRB1XGz#f4625a38-15eb-4850-8b0a-dbca72b39a10
    `https://6531befe4d4c2e3f333d41d1.mockapi.io/todo/${id}`,
    {
      method: "DELETE",
    }
  );
  const data = await res.json();

  return data;
}

async function updateTodoById(id, todo) {
  const res = await fetch(
    // check https://documenter.getpostman.com/view/8970478/2s9YRB1XGz#f4625a38-15eb-4850-8b0a-dbca72b39a10
    `https://6531befe4d4c2e3f333d41d1.mockapi.io/todo/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    }
  );
  const data = await res.json();

  return data;
}
//const getAllTodo = async () => {};

function App() {
  const [list, setList] = useState([]);

  const [value, setValue] = useState("");

  useEffect(() => {
    fecthAllTodos().then((data) => {
      setList(data);
    });
  }, []);

  return (
    <>
      <header>
        <h1>My To-Do List</h1>
      </header>
      <form
        onSubmit={(e) => {
          // prevent the default behavior of the form (refresh the page)
          e.preventDefault();

          const todo = {
            title: value,
            completed: false,
          };

          // This could be done better with optimistic update
          fetch("https://6531befe4d4c2e3f333d41d1.mockapi.io/todo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(todo),
          }).then((res) => {
            res.json().then((data) => {
              setList([...list, data]);
            });
            // reset the input
            setValue("");
          });
        }}
      >
        <input
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
        />
        <button type="submit">Add</button>
      </form>
      <main>
        {list.map((todo, i) => {
          return (
            <div key={todo.id} className={`todo `}>
              <input
                onChange={() => {
                  // This is non optimistic update
                  // we update the item after the api call

                  updateTodoById(todo.id, {
                    completed: !todo.completed,
                  }).then(() => {
                    // only update the list if the api call is successful
                    const newList = [...list];
                    newList[i].completed = !newList[i].completed;
                    setList(newList);
                  });
                }}
                type="checkbox"
                checked={todo.completed}
              />
              <p className={`${todo.completed ? "completed" : ""}`}>
                {todo.title}
              </p>
              <button
                onClick={() => {
                  // This is called optimistic update
                  // we delete the item from the list before the api call
                  // if the api call fails we can revert the change
                  // This is a good practice to improve the user experience
                  // and avoid the user to wait for the api call to finish
                  // more info: https://uxdesign.cc/optimistic-1000-95d4f7f0af4b

                  const newList = [...list];
                  // save the deleted item
                  const deleted = newList.splice(i, 1);
                  setList(newList);

                  deleteTodoById(todo.id).catch(() => {
                    // if the api call fails we revert the change
                    setList([...list, deleted[0]]);
                  });
                }}
                className="delete"
              >
                X
              </button>
            </div>
          );
        })}
      </main>
    </>
  );
}

export default App;
