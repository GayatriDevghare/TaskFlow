// import React from 'react'

const Footer = () => {
    let footerstyle={
        position:"relative",
        top:"100vh",
        wisth:"100%",
        backgroundColor:"yellow",
        border:"2px solid black",
    }
    return (
        <footer className="bg-dark text-length" style={footerstyle}>
            <p className="text-center">
                Copyright & copy; MyTodolist.com
            </p>
        </footer>
    )
}

export default Footer
