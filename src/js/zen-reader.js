//zen-reader
$( function() {
    var reader = $("#zen-reader");
    var content = reader.children( '.content' );
    var status = reader.children( '.status' );

    reader.children( 'div.right' ).on( 'click', function() {

        var visibleHeight = reader.height();
        var top = parseFloat( content.css( 'top') );
        var totalHeight = content.height();
        var limit = 0.0 - ( totalHeight - visibleHeight );
        var afterTop = top - visibleHeight;
        if ( ( totalHeight + top ) - visibleHeight >= 0 )
            reader.children( '.content' ).css( 'top', afterTop );
            console.log(afterTop, limit);
        status.html( Math.round( (0 - afterTop) / totalHeight * 100 ) + "%");
    });
    reader.children( 'div.left' ).on( 'click', function() {

        var visibleHeight = reader.height();
        var top = parseFloat( content.css( 'top') );
        var totalHeight = content.height();
        var limit = 0.0 - ( totalHeight - visibleHeight );
        var afterTop = top + visibleHeight;
console.log(afterTop,limit);
        if ( afterTop <= 0 )
            reader.children( '.content' ).css( 'top', afterTop );
        status.html( Math.round( (0 - afterTop) / ( totalHeight + visibleHeight ) * 100 ) + "%");
    });
});