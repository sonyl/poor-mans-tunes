import React, { Component, PropTypes } from 'react';


function Footer({message, artistCnt, albumCnt, songCnt}) {
    return (
        <div className='footer well well-sm' style={{marginTop: '15px'}}>
            <div className='row'>
                <div className='col-xs-6'>{message}</div>
                <div className='col-xs-6'>
                    <div className='col-sm-4'>
                        Artists: {artistCnt}
                    </div>
                    <div className='col-sm-4'>
                        Albums: {albumCnt}
                    </div>
                    <div className='col-sm-4'>
                        Songs: {songCnt}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Footer;


