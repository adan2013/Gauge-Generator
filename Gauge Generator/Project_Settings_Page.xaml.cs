﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for Project_Settings_Page.xaml
    /// </summary>
    public partial class Project_Settings_Page : Page
    {
        public Project_Settings_Page()
        {
            InitializeComponent();
            prop_grid.SelectedObject = Global.project;
            Global.RefreshScreen();
        }

        private void Close_btn(object sender, RoutedEventArgs e)
        {
            Global.SetSidebar(Global.SidebarPages.Layers);
        }

        private void Prop_grid_PropertyValueChanged(object sender, Xceed.Wpf.Toolkit.PropertyGrid.PropertyValueChangedEventArgs e)
        {
            Global.RefreshScreen();
            Global.dms.CheckChanges();
        }
    }
}
