﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            Global.SetSidebarObject(sidebar_frame, sidebar_title);
            Global.SetSidebar(Global.SidebarPages.Layers);
            Global.ScreenCanvas = preview;
        }

        private void Preview_SizeChanged(object sender, SizeChangedEventArgs e)
        {
            preview.Width = Math.Min(e.NewSize.Width, e.NewSize.Height);
            preview.Height = Math.Min(e.NewSize.Width, e.NewSize.Height);
            Global.RefreshScreen();

            //TODO diagnostic code
            Global.project.layers.Add(new Range_Item());
            Global.EditingLayer = Global.project.layers[0];
            Global.SetSidebar(Global.SidebarPages.Editor);
        }
    }
}
