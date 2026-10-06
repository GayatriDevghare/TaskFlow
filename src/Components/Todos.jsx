import React from 'react'
import Todoitem from "./Todoitem";

export const Todos = (props) => {
    let myStyle = {
        minHeight: "70vh",
        marginBottom: "10px auto"
    }
    return (
        <div className="container my-3" style={myStyle}>
            <h3 className=" my-3"> Todos List </h3>
            {props.todos.length === 0 ? "No Todos to display" :
                props.todos.map((todo) => {
                    return (
                        <React.Fragment key={todo.sno}>
                            <Todoitem
                                todo={todo}
                                onDelete={props.onDelete}
                            />
                            <hr />
                        </React.Fragment>
                    )
                })}

        </div >
    )
}

export default Todos