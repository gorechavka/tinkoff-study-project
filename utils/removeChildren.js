const removeChildren = (node) => {
    while (node.firstChild){
        node.removeChild(node.firstChild)
    }
    return node
}