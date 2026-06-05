import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCirclePlus, faFileImport, faHome, faMicrochip } from '@fortawesome/free-solid-svg-icons';

import Tippy from '@tippyjs/react';
import { NavbarButton, NavbarContainer, NavbarHeader, NavbarSection } from './styles';
import { get } from '../../utils/requests';

const Navbar: React.FC = () => {
    const [hasGpu, setHasGpu] = useState<boolean>(false);
    const [gpuDevice, setGpuDevice] = useState<string | null>(null);

    useEffect(() => {
        const checkGpuStatus = async () => {
            try {
                const response = await get<{ has_gpu: boolean; device: string | null }>('/gpu-check');
                if (response.success) {
                    setHasGpu(response.data.has_gpu);
                    setGpuDevice(response.data.device);
                } else {
                    console.error('Failed to check GPU status:', response.error);
                    setHasGpu(false);
                    setGpuDevice(null);
                }
            } catch (error) {
                console.error('Failed to check GPU status:', error);
                setHasGpu(false);
                setGpuDevice(null);
            }
        };

        checkGpuStatus();
    }, []);

    return (
        <NavbarContainer>
            <NavbarSection>
                <NavbarHeader to="/">VAME Desktop</NavbarHeader>
            </NavbarSection>
            <NavbarSection>
                <Link to="/">
                    <Tippy content={<span>Home page</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faHome} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Link to="/create">
                    <Tippy content={<span>Create a new project</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faFileCirclePlus} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Link to="/load">
                    <Tippy content={<span>Load an external project</span>}>
                        <span>
                            <NavbarButton>
                                <FontAwesomeIcon icon={faFileImport} />
                            </NavbarButton>
                        </span>
                    </Tippy>
                </Link>
                <Tippy content={<span>{hasGpu ? `GPU: ${gpuDevice}` : 'No GPU detected'}</span>}>
                    <span>
                        <NavbarButton
                            as="span"
                            style={{
                                background: hasGpu ? 'var(--color-success)' : 'var(--color-error)',
                                cursor: 'default',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}
                        >
                            <FontAwesomeIcon icon={faMicrochip} />
                        </NavbarButton>
                    </span>
                </Tippy>
            </NavbarSection>
        </NavbarContainer>
    );
}

export default Navbar;
