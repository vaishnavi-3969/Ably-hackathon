import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "../styles/Kaban.module.css";


// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `task ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  borderRadius: "5px",

  // change background colour if dragging
  background: isDragging ? "#5BE9B9" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "#6e07f3" : "#defaf1",
  padding: grid,
  width: 250
});

export default function Kanban() {
  const [state, setState] = useState([]);
  const [value, setValue] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [headers, setHeaders] = useState([]);
  const [task , setTask] = useState('');
  const [itemCount, setItemCount] = useState(16);

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter(group => group.length));
    }
  }

  const handleUpdateHeader = (e) => {
    let input = document.getElementById(`${e.target.id}-input`);

    if (input.style.display === "none") {
      input.style.display = "";
    } else {
      input.style.display = "none";
    }
   
    if (headerValue === "") {
      return;
    }

    let header = e.target.innerHTML;
    const newHeaders = [...headers];
    const index = newHeaders.indexOf(header);
    
    newHeaders.splice(index, 1, headerValue);
    setHeaders(newHeaders);
    if (headerValue !== "") {
      setHeaderValue("");
    }
  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      let input = document.getElementById(`${e.target.id}`);
      input.style.display = "none";

      let header = input.id.split("-")[0];
      const newHeaders = [...headers];
      const index = newHeaders.indexOf(header);
      
      newHeaders.splice(index, 1, headerValue);
      setHeaders(newHeaders);
      if (headerValue !== "") {
        setHeaderValue("");
      }
    }
  }

  const handleClickEdit = (e) => {
    let input = document.getElementById(`${e.target.id}=input`);
    let taskElement = document.getElementById(`${e.target.id}=task`);

    if (input.style.display === "none") {
      input.style.display = "";
    } else {
      input.style.display = "none";
    }

    if (task === "") {
      return;
    }

    taskElement.innerHTML = task;

    if (task !== "") {
      setTask("");
    }
  }

  const handleKeyDownEdit = (e) => {
    if (e.key === "Enter") {
      let taskElement = document.getElementById(`${e.target.id.split('=')[0]}=task`);
      
      e.target.style.display = "none";
      taskElement.innerHTML = task;

      setTask("");
    }
  }

  useEffect(() => {
    setState([getItems(4), getItems(4, 8), getItems(4, 12), getItems(4, 16)]);
    setHeaders(["Default Group 1", "Default Group 2", "Default Group 3", "Default Group 4"]);
  }, []);

  return (
    // console.log('state: ', state),
    // console.log('headers: ', headers),
    <div className={styles.kabanMain}>
      <h1>Ably Collaboration App</h1>
      <input 
        type="text" 
        placeholder="Enter name of column" 
        id="new-column-name" 
        onChange={(e) => setValue(e.target.value)} 
        value={value}
      />
      <button
        type="button"
        onClick={() => {
          if (value === "") {
            alert("Please enter name of column");
            return;
          } else {
          setHeaders([...headers, value]);
          setState([...state, []]);
          setValue("");
          setState([...state, getItems(1, itemCount)]);
          }
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1, itemCount)]);
          setHeaders([...headers, `New Column`]);
          setItemCount(itemCount + 1);
        }}
      >
        Add new item
      </button>
     
      <div style={{ display: "flex" }}> 
        <DragDropContext onDragEnd={onDragEnd}>
          { state ? state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >              
                <span className={styles.columnHeader} id={headers[ind]} onClick={(e)=> handleUpdateHeader(e)}>
                  {headers[ind] }
                </span>
                <input type="text" id={`${headers[ind]}-input`} key={ind}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  onKeyDown={(e)=> handleKeyDown(e)} 
                  className={styles.columnHeaderInput}
                  style={{ display: 'none'}}
                  value={headerValue} 
                />
                  {el.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div
                          className={styles.taskCard}
                          >
                            <span className={styles.taskTitle} id={`${item.id}=task`}>{item.content}</span>
                            <button
                              className={styles.taskButton}
                              type="button"
                              onClick={() => {
                                const newState = [...state];
                                newState[ind].splice(index, 1);
                                setState(
                                  newState.filter(group => {
                                    if (group.length === 0) {
                                      const newHeaders = [...headers];
                                      newHeaders.splice(ind, 1);
                                      setHeaders(newHeaders);
                                    }
                                    return group.length
                                  })
                                );
                              }}
                            >
                              delete
                            </button>
                            <button
                              type="button"
                              className={styles.taskButton}
                              onClick={(e) => {handleClickEdit(e)}}
                              id={item.id}
                            >
                              edit/save
                            </button>
                            <input type="text" 
                              id={`${item.id}=input`} 
                              key={ind} 
                              style={{ display: 'none', height: '30px' }} 
                              value={task}
                              onChange={(e) => {setTask(e.target.value) }}
                              onKeyDown={(e)=> handleKeyDownEdit(e)}
                            />
                            <span className={styles.id}>id: {item.id.split('-')[1]}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )): null }
        </DragDropContext>
      </div>
    </div>
  );
}