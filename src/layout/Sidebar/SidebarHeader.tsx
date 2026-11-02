import React from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {Link} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import {ArrowBarToLeft} from 'tabler-icons-react';
import {toggleCollapsedNav} from '../../redux/action/Theme';

// Images
import logo from '../../assets/img/brand-sm.svg';
import jampackImg from '../../assets/img/Jampack.svg';

interface RootState {
    theme: {
        navCollapsed: boolean;
    };
}

const mapStateToProps = (state: RootState) => ({
    navCollapsed: state.theme.navCollapsed,
});

const connector = connect(mapStateToProps, {
    toggleCollapsedNav,
});

type Props = ConnectedProps<typeof connector>;

const SidebarHeader: React.FC<Props> = ({
    navCollapsed,
    toggleCollapsedNav,
}) => {
    const toggleSidebar = (): void => {
        toggleCollapsedNav(!navCollapsed);

        document.getElementById('tggl-btn')?.blur();
    };

    return (
        <div className="menu-header">
            <span>
                <Link className="navbar-brand" to="/">
                    <img
                        className="brand-img img-fluid"
                        src={logo}
                        alt="brand"
                    />

                    <img
                        className="brand-img img-fluid"
                        src={jampackImg}
                        alt="brand"
                    />
                </Link>

                <Button
                    id="tggl-btn"
                    variant="flush-dark"
                    onClick={toggleSidebar}
                    className="btn-icon btn-rounded flush-soft-hover navbar-toggle"
                >
                    <span className="icon">
                        <span className="svg-icon fs-5">
                            <ArrowBarToLeft />
                        </span>
                    </span>
                </Button>
            </span>
        </div>
    );
};

export default connector(SidebarHeader);